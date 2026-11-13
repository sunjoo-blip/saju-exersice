/**
 * 하루 1회 레이트리밋 — OpenAI 토큰 비용 보호 (명세: 브라우저당/IP당 하루 제한).
 *
 * 2중 방어:
 *  1) 브라우저 쿠키(up_bid)  — 기본 하루 1회. 평범한 재방문을 막습니다.
 *  2) 클라이언트 IP        — 기본 하루 5회. 시크릿창/쿠키삭제 우회를 막는 백스톱.
 *     (한국 모바일/사내망은 IP를 공유하므로 IP는 넉넉히 둬 오탐을 줄입니다.)
 *
 * 저장소: Redis(ioredis) — REDIS_URL(redis://) 재사용.
 *  - REDIS_URL 이 없으면 레이트리밋을 끕니다(로컬 개발용). 배포 시 반드시 설정하세요.
 *  - Redis 장애 시에는 '허용'으로 열어(fail-open) 서비스 자체가 멈추지 않게 합니다.
 *    (비용의 1차 방어선은 ACCESS_CODES 게이트입니다.)
 */

import Redis from "ioredis";
import { NextResponse } from "next/server";

const COOKIE_NAME = "up_bid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // 약 400일 — 브라우저 식별자 유지

const PER_BROWSER = num(process.env.RATE_LIMIT_PER_BROWSER, 1);
const PER_IP = num(process.env.RATE_LIMIT_PER_IP, 5);

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

// 서버리스에서 연결 재사용 (핫리로드/재호출 시 커넥션 폭증 방지) — bizmsg 와 동일 패턴.
const g = globalThis as unknown as { __unwoonRedis?: Redis | null };
function redis(): Redis | null {
  if (g.__unwoonRedis !== undefined) return g.__unwoonRedis;
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    g.__unwoonRedis = null;
    return null;
  }
  const client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: false });
  // 'error' 리스너가 없으면 커넥션 오류가 프로세스로 전파되므로 무해화 (fail-open 은 호출부에서 처리).
  client.on("error", () => {});
  g.__unwoonRedis = client;
  return client;
}

/** Asia/Seoul 기준 날짜 키(yyyymmdd)와 자정까지 남은 초(TTL). */
function kstDay(): { day: string; ttl: number } {
  const nowMs = Date.now();
  const kstMs = nowMs + 9 * 60 * 60 * 1000;
  const k = new Date(kstMs);
  const y = k.getUTCFullYear();
  const m = k.getUTCMonth();
  const d = k.getUTCDate();
  const day = `${y}${String(m + 1).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  const nextMidnight = Date.UTC(y, m, d) + 24 * 60 * 60 * 1000;
  const ttl = Math.max(60, Math.ceil((nextMidnight - kstMs) / 1000));
  return { day, ttl };
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** INCR 후 최초 1회만 TTL 설정. 반환값은 증가 후 카운트. */
async function hit(r: Redis, key: string, ttl: number): Promise<number> {
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, ttl);
  return count;
}

export interface RateLimitResult {
  /** OpenAI 호출을 허용할지 */
  allowed: boolean;
  /** 모든 응답에 심어야 할 브라우저 식별 쿠키 값 (신규/기존) */
  browserId: string;
  /** 차단 시 안내 메시지 */
  message?: string;
  /** 생성에 실패해 슬롯을 되돌려줄 때 호출 (실패는 과금이 없으므로 카운트 환불) */
  rollback: () => Promise<void>;
}

const NOOP = async () => {};

/**
 * analyze 요청의 레이트리밋을 평가하고 카운터를 선점(INCR)합니다.
 * - 생성 성공 시: 그대로 두어 하루 한도를 소진.
 * - 생성 실패 시: result.rollback() 으로 카운트를 환불(사용자 불이익 방지).
 */
export async function checkRateLimit(req: Request): Promise<RateLimitResult> {
  const browserId = readCookie(req, COOKIE_NAME) ?? crypto.randomUUID();
  const r = redis();
  if (!r) return { allowed: true, browserId, rollback: NOOP }; // 미설정 = 비활성(개발용)

  const { day, ttl } = kstDay();
  const ipKey = `rl:analyze:${day}:ip:${clientIp(req)}`;
  const bidKey = `rl:analyze:${day}:bid:${browserId}`;

  try {
    const [ipCount, bidCount] = await Promise.all([
      hit(r, ipKey, ttl),
      hit(r, bidKey, ttl),
    ]);

    const overBrowser = bidCount > PER_BROWSER;
    const overIp = ipCount > PER_IP;
    if (overBrowser || overIp) {
      return {
        allowed: false,
        browserId,
        message: overBrowser
          ? "오늘의 운동 팔자 해석은 이미 확인했어요. 내일 다시 찾아와 주세요! 🙏"
          : "지금은 이용자가 많아요. 잠시 뒤(내일) 다시 시도해 주세요. 🙏",
        rollback: NOOP, // 차단된 요청은 되돌릴 필요 없음
      };
    }

    const rollback = async () => {
      try {
        await Promise.all([r.decr(ipKey), r.decr(bidKey)]);
      } catch {
        /* 환불 실패는 치명적이지 않음 */
      }
    };
    return { allowed: true, browserId, rollback };
  } catch {
    // Redis 장애 → 서비스가 멈추지 않도록 허용(fail-open).
    return { allowed: true, browserId, rollback: NOOP };
  }
}

/** 브라우저 식별 쿠키를 응답에 심습니다. (모든 analyze 응답에 공통 적용) */
export function withBrowserCookie<T extends NextResponse>(
  res: T,
  browserId: string,
): T {
  res.cookies.set(COOKIE_NAME, browserId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
