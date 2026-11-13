"use client";

import { useState } from "react";
import { sajuInputSchema } from "@/lib/saju/validate";
import type { SajuInput } from "@/lib/saju/types";

interface Props {
  onSubmit: (input: SajuInput) => void;
  onBack: () => void;
  /** 오늘 한도 초과 시 안내 문구. 있으면 제출 버튼을 비활성화합니다. */
  blockedMessage?: string | null;
}

/** 숫자만 입력해도 yyyy/mm/dd 로 자동 포맷 (20001220 → 2000/12/20) */
function formatDate(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join("/");
}

/** 숫자만 입력해도 hh:mm 으로 자동 포맷 (0915 → 09:15) */
function formatTime(v: string): string {
  const t = v.replace(/\D/g, "").slice(0, 4);
  return [t.slice(0, 2), t.slice(2, 4)].filter(Boolean).join(":");
}

export default function InputForm({ onSubmit, onBack, blockedMessage }: Props) {
  const [nickname, setNickname] = useState("");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [hourUnknown, setHourUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedMessage) return; // 오늘 한도 초과 — 제출 차단
    setError(null);

    // 날짜: yyyy/mm/dd (구분자 / - . 허용)
    const dateMatch = birthDate
      .trim()
      .match(/^(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})$/);
    if (!dateMatch) {
      setError("생년월일을 yyyy/mm/dd 형식으로 입력해 주세요. (예: 1992/03/11)");
      return;
    }

    // 시간: hh:mm (분 생략 시 0)
    let hourVal: number | null = null;
    let minuteVal = 0;
    if (!hourUnknown) {
      const timeMatch = birthTime.trim().match(/^(\d{1,2})\s*:\s*(\d{1,2})?$/);
      if (!timeMatch) {
        setError(
          "출생 시간을 hh:mm 형식으로 입력하거나 '출생 시간 모름'을 선택해 주세요. (예: 09:15)",
        );
        return;
      }
      hourVal = Number(timeMatch[1]);
      minuteVal = timeMatch[2] ? Number(timeMatch[2]) : 0;
    }

    const candidate: SajuInput = {
      year: Number(dateMatch[1]),
      month: Number(dateMatch[2]),
      day: Number(dateMatch[3]),
      hour: hourVal,
      minute: minuteVal,
      isLunar: calendar === "lunar",
      isLeapMonth: calendar === "lunar" ? isLeapMonth : undefined,
      nickname: nickname.trim() || undefined,
    };

    const parsed = sajuInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
      return;
    }

    onSubmit(candidate);
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="eyebrow">STEP 01</p>
      <h1 className="display">너의 사주를 알려줘</h1>
      <p className="sub">
        태어난 날짜와 시간으로 운동 팔자를 봐 드릴게요. 입력한 정보는 결과 생성에만
        쓰이고 따로 저장하지 않아요.
      </p>

      <div className="card">
        <div className="field">
          <label>닉네임 (선택)</label>
          <input
            className="input"
            placeholder="결과 카드에 불러줄 이름"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="field">
          <label>양력 / 음력</label>
          <div className="segmented">
            <div
              className={`seg ${calendar === "solar" ? "active" : ""}`}
              onClick={() => setCalendar("solar")}
              role="button"
              tabIndex={0}
            >
              양력
            </div>
            <div
              className={`seg ${calendar === "lunar" ? "active" : ""}`}
              onClick={() => setCalendar("lunar")}
              role="button"
              tabIndex={0}
            >
              음력
            </div>
          </div>
          {calendar === "lunar" && (
            <label className="checkbox" style={{ marginTop: 10 }}>
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
              />
              윤달이에요
            </label>
          )}
        </div>

        <div className="field">
          <label>생년월일</label>
          <input
            className="input"
            inputMode="numeric"
            placeholder="yyyy/mm/dd (예: 1992/03/11)"
            value={birthDate}
            maxLength={10}
            onChange={(e) => setBirthDate(formatDate(e.target.value))}
          />
        </div>

        <div className="field">
          <label>출생 시간</label>
          <input
            className="input"
            inputMode="numeric"
            placeholder="hh:mm (예: 10:31)"
            value={birthTime}
            disabled={hourUnknown}
            maxLength={5}
            onChange={(e) => setBirthTime(formatTime(e.target.value))}
          />
          <label className="checkbox" style={{ marginTop: 10 }}>
            <input
              type="checkbox"
              checked={hourUnknown}
              onChange={(e) => setHourUnknown(e.target.checked)}
            />
            출생 시간을 몰라요 (시주 제외하고 분석)
          </label>
          {hourUnknown && (
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              시주(時柱)를 제외하고 분석해요. 조금 더 간략한 결과가 나올 수 있어요.
            </p>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="stack">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!!blockedMessage}
        >
          {blockedMessage ? "오늘의 운동 팔자는 이미 확인했어요" : "내 운동 팔자 보기"}
        </button>
        {blockedMessage && (
          <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
            {blockedMessage}
          </p>
        )}
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          뒤로
        </button>
      </div>
    </form>
  );
}
