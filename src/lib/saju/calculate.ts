/**
 * 만세력 계산 — lunar-typescript(검증된 절기/음양력/60갑자 라이브러리) 기반.
 *
 * 명세 F3 준수:
 *  - 사주 원국(4주) 계산은 라이브러리가 절기(節氣)·입춘·자시 경계를 처리합니다.
 *  - AI가 생년월일만 보고 임의 계산하지 않도록, 이 모듈이 "사실"을 만들어
 *    AI 모듈에 전달합니다.
 *
 * 진태양시(眞太陽時) 보정:
 *  - 한국 표준시는 동경 135°E 기준이지만 실제 한국(서울 약 127°E)은 약 -32분 차이.
 *    포스텔러 등 주요 만세력과 동일하게, 출생시각이 있는 경우 -32분을 보정한 뒤
 *    시주(및 경계 시 일주)를 계산합니다. (docs/SAJU_RULES.md 참고)
 *
 * 알려진 한계:
 *  - 균시차(균時差)·서머타임·출생지별 경도차는 반영하지 않고 서울 기준 고정 보정만 적용합니다.
 */

import { Lunar, Solar } from "lunar-typescript";
import {
  CHEONGAN,
  CHEONGAN_OHAENG,
  JIJI,
  JIJI_OHAENG,
} from "./constants";
import { calcOhaengDistribution } from "./ohaeng";
import { judgeSinsal } from "./sinsal";
import type { Pillar, SajuInput, SajuResult } from "./types";

/**
 * 진태양시 보정량(분). 한국 표준시(135°E) ↔ 서울(약 126.98°E) 경도차.
 * (135 - 126.98) × 4분/도 ≈ 32분. 포스텔러 등 주요 만세력 기본값과 일치.
 */
const SOLAR_TIME_CORRECTION_MIN = 32;

/** 양력 시각에서 진태양시 보정(-32분)을 적용한 새 Solar 를 반환 (날짜 넘어감도 처리) */
function applySolarTimeCorrection(solar: Solar): Solar {
  const d = new Date(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond(),
  );
  d.setMinutes(d.getMinutes() - SOLAR_TIME_CORRECTION_MIN);
  return Solar.fromYmdHms(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  );
}

/** 간지 한자 2글자(예: "甲子")를 Pillar 로 변환 */
function toPillar(ganjiHanja: string): Pillar {
  const ganHanja = ganjiHanja.charAt(0);
  const jijiHanja = ganjiHanja.charAt(1);

  const gan = CHEONGAN[ganHanja];
  const jiji = JIJI[jijiHanja];
  const ganOhaeng = CHEONGAN_OHAENG[ganHanja];
  const jijiOhaeng = JIJI_OHAENG[jijiHanja];

  if (!gan || !jiji || !ganOhaeng || !jijiOhaeng) {
    throw new Error(`알 수 없는 간지입니다: ${ganjiHanja}`);
  }

  return { ganjiHanja, gan, jiji, ganHanja, jijiHanja, ganOhaeng, jijiOhaeng };
}

/**
 * 입력(양/음력) → 양력 Solar 로 정규화.
 * 출생 시간을 모를 경우 낮 12시로 두어 자시 경계 영향을 피하고, 시주는 이후 제외.
 */
function toSolar(input: SajuInput): Solar {
  const hour = input.hour ?? 12;
  const minute = input.hour === null ? 0 : input.minute;

  if (input.isLunar) {
    // lunar-typescript 윤달 표기: 월에 음수 사용 (예: 윤3월 → -3)
    const lunarMonth = input.isLeapMonth ? -input.month : input.month;
    const lunar = Lunar.fromYmdHms(
      input.year,
      lunarMonth,
      input.day,
      hour,
      minute,
      0,
    );
    return lunar.getSolar();
  }

  return Solar.fromYmdHms(input.year, input.month, input.day, hour, minute, 0);
}

export function calculateSaju(input: SajuInput): SajuResult {
  const solar = toSolar(input);
  const lunar = solar.getLunar();
  // 사주(원국)는 진태양시 보정 시각으로 계산. 시간 미입력(12시 고정) 시에는 보정 불필요.
  const calcSolar =
    input.hour === null ? solar : applySolarTimeCorrection(solar);
  const eightChar = calcSolar.getLunar().getEightChar();

  const yearPillar = toPillar(eightChar.getYear());
  const monthPillar = toPillar(eightChar.getMonth());
  const dayPillar = toPillar(eightChar.getDay());
  const hourUnknown = input.hour === null;
  const hourPillar = hourUnknown ? null : toPillar(eightChar.getTime());

  const pillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  const ohaeng = calcOhaengDistribution(pillars);
  const sinsal = judgeSinsal(pillars);

  const ilgan = {
    gan: dayPillar.gan,
    ganHanja: dayPillar.ganHanja,
    ohaeng: dayPillar.ganOhaeng,
  };

  const leapMark = lunar.getMonth() < 0 ? "윤" : "";
  const lunarDate = `음력 ${lunar.getYear()}년 ${leapMark}${Math.abs(
    lunar.getMonth(),
  )}월 ${lunar.getDay()}일`;

  return {
    pillars,
    ohaeng,
    sinsal,
    ilgan,
    hourUnknown,
    meta: {
      solarDate: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(
        solar.getDay(),
      ).padStart(2, "0")}`,
      lunarDate,
      note: hourUnknown
        ? "출생 시간 미입력 → 시주(時柱)를 제외하고 분석했습니다."
        : "연·월·일·시 4주 전체를 분석했습니다.",
    },
  };
}
