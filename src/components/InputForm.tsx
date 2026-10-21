"use client";

import { useState } from "react";
import { sajuInputSchema } from "@/lib/saju/validate";
import type { SajuInput } from "@/lib/saju/types";

interface Props {
  onSubmit: (input: SajuInput) => void;
  onBack: () => void;
}

export default function InputForm({ onSubmit, onBack }: Props) {
  const [nickname, setNickname] = useState("");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [hourUnknown, setHourUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const candidate: SajuInput = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: hourUnknown ? null : hour === "" ? null : Number(hour),
      minute: hourUnknown || minute === "" ? 0 : Number(minute),
      isLunar: calendar === "lunar",
      isLeapMonth: calendar === "lunar" ? isLeapMonth : undefined,
      nickname: nickname.trim() || undefined,
    };

    if (!candidate.year || !candidate.month || !candidate.day) {
      setError("생년월일을 모두 입력해 주세요.");
      return;
    }
    if (!hourUnknown && hour === "") {
      setError("출생 시간을 입력하거나 '출생 시간 모름'을 선택해 주세요.");
      return;
    }

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
          <div className="row">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="년"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="월"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="일"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>출생 시간</label>
          <div className="row" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="시 (0-23)"
              value={hour}
              disabled={hourUnknown}
              onChange={(e) => setHour(e.target.value)}
            />
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="분 (0-59)"
              value={minute}
              disabled={hourUnknown}
              onChange={(e) => setMinute(e.target.value)}
            />
          </div>
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
        <button type="submit" className="btn btn-primary">
          내 운동 팔자 보기
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          뒤로
        </button>
      </div>
    </form>
  );
}
