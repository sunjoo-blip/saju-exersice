"use client";

import { useEffect, useState } from "react";
import InputForm from "@/components/InputForm";
import ResultView from "@/components/ResultView";
import Character from "@/components/Character";
import Brand from "@/components/Brand";
import type { SajuInput } from "@/lib/saju/types";
import type { Recommendation } from "@/lib/ai/schema";
import type { AnalyzeResponse, SajuResponse, SajuSuccess } from "@/lib/types";

type Step = "landing" | "input" | "loading" | "result" | "error";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  // 사주 계산 결과(즉시) + AI 해석(나중에 채움)을 따로 들고 있음
  const [base, setBase] = useState<SajuSuccess | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [code, setCode] = useState<string>("");
  // 오늘 한도를 넘겼으면 안내 문구(= 버튼 비활성화 신호). null 이면 이용 가능.
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  // 접속 코드는 localStorage 에 기억해 재입력 수고를 덜어줍니다.
  useEffect(() => {
    setCode(localStorage.getItem("accessCode") ?? "");
  }, []);

  function saveCode(next: string) {
    setCode(next);
    localStorage.setItem("accessCode", next);
  }

  // 랜딩 '입장' 버튼: 입력 화면으로 넘어가기 전에 코드를 먼저 검증.
  // 성공하면 input 단계로 이동, 실패하면 Landing 에 에러를 돌려줌.
  async function enter(): Promise<string | null> {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "x-access-code": encodeURIComponent(code) },
      });
      if (!res.ok) return "접속 코드가 올바르지 않아요.";
      // 입장과 동시에 오늘 한도를 미리 확인 → 초과면 입력 화면 버튼을 비활성화.
      await refreshQuota();
      setStep("input");
      return null;
    } catch {
      return "접속 확인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
    }
  }

  /** 오늘 분석 가능 여부를 읽기 전용으로 확인(비용 없음). 실패 시엔 허용으로 간주. */
  async function refreshQuota() {
    try {
      const q = await (
        await fetch("/api/quota", {
          headers: { "x-access-code": encodeURIComponent(code) },
        })
      ).json();
      setBlockedMsg(q.ok && q.allowed === false ? q.message : null);
    } catch {
      setBlockedMsg(null);
    }
  }

  function post(path: string, input: SajuInput) {
    return fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-code": encodeURIComponent(code),
      },
      body: JSON.stringify(input),
    });
  }

  /** AI 해석 — 결과 화면을 먼저 보여준 뒤 백그라운드로 채움 */
  async function loadInterpretation(input: SajuInput) {
    setRec(null);
    setRecError(null);
    try {
      const data: AnalyzeResponse = await (await post("/api/analyze", input)).json();
      if (!data.ok) {
        setRecError(data.error);
        return;
      }
      setRec(data.recommendation);
    } catch {
      setRecError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  async function analyze(input: SajuInput) {
    setStep("loading");
    try {
      // 1) 사주 계산 + 추천 운동은 규칙 기반이라 즉시 응답.
      //    하루 한도를 넘겼으면 여기서 막혀 결과 화면으로 넘어가지 않음.
      const data: SajuResponse = await (await post("/api/saju", input)).json();
      if (!data.ok) {
        setErrorMsg(data.error);
        setStep("error");
        return;
      }
      setBase(data);
      setStep("result");
      window.scrollTo({ top: 0 });
      // 2) AI 해석은 이어서 채움
      void loadInterpretation(input);
    } catch {
      setErrorMsg("네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
      setStep("error");
    }
  }

  return (
    <main className="shell">
      {step === "landing" && (
        <Landing code={code} onCodeChange={saveCode} onEnter={enter} />
      )}

      {step === "input" && (
        <InputForm
          onSubmit={analyze}
          onBack={() => setStep("landing")}
          blockedMessage={blockedMsg}
        />
      )}

      {step === "loading" && <Loading />}

      {step === "result" && base && (
        <ResultView base={base} rec={rec} recError={recError} />
      )}

      {step === "error" && (
        <ErrorView
          message={errorMsg}
          onRetry={() => setStep("input")}
          onHome={() => setStep("landing")}
        />
      )}
    </main>
  );
}

function Landing({
  code,
  onCodeChange,
  onEnter,
}: {
  code: string;
  onCodeChange: (v: string) => void;
  onEnter: () => Promise<string | null>;
}) {
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  async function handleEnter() {
    if (code.trim().length === 0 || verifying) return;
    setVerifying(true);
    setCodeError(null);
    const err = await onEnter();
    if (err) setCodeError(err);
    setVerifying(false);
  }

  return (
    <div className="landing">
      <Brand right={<span className="pill">무료 · 1분</span>} />

      <div className="landing-hero">
        <h1 className="display">
          내 사주 속 동물이
          <br />
          운동을 골라줄게
        </h1>
        <p className="sub">60가지 일주 동물 중 나는 누구?</p>
      </div>

      <div className="stage" aria-hidden>
        <span className="stage-bubble">나랑 같이 운동할래?</span>
        <div className="stage-hill" />
        <Character name="여우" size={150} className="stage-side stage-left" />
        <Character name="토끼" size={150} className="stage-side stage-right" />
        <Character name="사자" size={220} className="stage-main" />
      </div>

      <div className="card landing-card">
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="access-code">접속 코드</label>
          <input
            id="access-code"
            className="input"
            placeholder="초대받은 코드를 입력하세요"
            value={code}
            onChange={(e) => {
              onCodeChange(e.target.value);
              if (codeError) setCodeError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEnter();
            }}
            autoComplete="off"
          />
          {codeError && (
            <p className="error-text" style={{ marginTop: 8 }}>
              {codeError}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleEnter}
          disabled={code.trim().length === 0 || verifying}
        >
          {verifying ? "확인 중…" : "내 운동 동물 만나기"}
        </button>
      </div>

      <section className="roster">
        <h2 className="roster-title">이 친구들 중 하나가 나와요</h2>
        <ul className="roster-grid">
          {ROSTER.map((name, i) => (
            <li key={name}>
              <span className={`roster-tile tone-${i % 4}`}>
                <Character name={name} size={74} animated={false} />
              </span>
              {name}
            </li>
          ))}
        </ul>
      </section>

      <p className="disclaimer">
        초대받은 분만 접속 코드로 이용할 수 있어요. 생년월일은 결과 계산에만 쓰고 저장하지 않아요.
        <br />
        명리학 기반 엔터테인먼트 콘텐츠이며 과학적 진단이 아닙니다.
      </p>
    </div>
  );
}

const ROSTER = ["사자", "여우", "곰", "토끼", "고양이", "다람쥐", "기린", "학", "돌고래", "거북이"];

function Loading() {
  return (
    <div className="loading">
      <Character name="거북이" size={180} />
      <p className="loading-title">사주를 풀어보는 중…</p>
      <p className="muted">오행과 신살을 살펴 내 운동 동물을 찾고 있어요.</p>
    </div>
  );
}

function ErrorView({
  message,
  onRetry,
  onHome,
}: {
  message: string;
  onRetry: () => void;
  onHome: () => void;
}) {
  return (
    <div className="center" style={{ paddingTop: 64 }}>
      <h1 className="display">앗, 문제가 생겼어요</h1>
      <div className="notice" style={{ textAlign: "left", margin: "16px 0" }}>
        {message}
      </div>
      <div className="stack">
        <button className="btn btn-primary" onClick={onRetry}>
          다시 시도하기
        </button>
        <button className="btn btn-ghost" onClick={onHome}>
          처음으로
        </button>
      </div>
    </div>
  );
}
