"use client";

import { useEffect, useState } from "react";
import InputForm from "@/components/InputForm";
import ResultView from "@/components/ResultView";
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
    <div className="center" style={{ paddingTop: 48 }}>
      <p className="eyebrow">명리학 x 운동</p>
      <h1 className="display">
        내 사주에 맞는
        <br />
        운동이 따로 있다고?
      </h1>
      <p className="sub">태어난 날짜와 시간으로 알아보는 나의 운동 팔자</p>

      <div style={{ margin: "48px 0 32px", fontSize: 64 }} className="serif">
        ☯
      </div>

      <div className="field" style={{ maxWidth: 280, margin: "0 auto 12px" }}>
        <input
          className="input"
          placeholder="접속 코드를 입력하세요"
          value={code}
          onChange={(e) => {
            onCodeChange(e.target.value);
            if (codeError) setCodeError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnter();
          }}
          autoComplete="off"
          style={{ textAlign: "center" }}
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
        {verifying ? "확인 중…" : "내 운동 팔자 확인하기"}
      </button>

      <p className="disclaimer">
        초대받은 분만 접속 코드로 이용할 수 있어요.
        <br />
        명리학 기반 엔터테인먼트 콘텐츠이며 과학적 진단이 아닙니다.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p className="serif" style={{ fontSize: 20 }}>
        사주를 풀어보는 중…
      </p>
      <p className="muted">오행과 신살을 살펴 운동 팔자를 짓고 있어요.</p>
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
