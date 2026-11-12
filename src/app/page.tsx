"use client";

import { useEffect, useState } from "react";
import InputForm from "@/components/InputForm";
import ResultView from "@/components/ResultView";
import type { SajuInput } from "@/lib/saju/types";
import type { AnalyzeResponse, AnalyzeSuccess } from "@/lib/types";

type Step = "landing" | "input" | "loading" | "result" | "error";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [result, setResult] = useState<AnalyzeSuccess | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [code, setCode] = useState<string>("");

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
        headers: { "x-access-code": code },
      });
      if (!res.ok) return "접속 코드가 올바르지 않아요.";
      setStep("input");
      return null;
    } catch {
      return "접속 확인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
    }
  }

  async function analyze(input: SajuInput) {
    setStep("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": code,
        },
        body: JSON.stringify(input),
      });
      const data: AnalyzeResponse = await res.json();
      if (!data.ok) {
        setErrorMsg(data.error);
        setStep("error");
        return;
      }
      setResult(data);
      setStep("result");
      window.scrollTo({ top: 0 });
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
        <InputForm onSubmit={analyze} onBack={() => setStep("landing")} />
      )}

      {step === "loading" && <Loading />}

      {step === "result" && result && (
        <ResultView data={result} onRestart={() => setStep("landing")} />
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
