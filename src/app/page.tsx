"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import ResultView from "@/components/ResultView";
import type { SajuInput } from "@/lib/saju/types";
import type { AnalyzeResponse, AnalyzeSuccess } from "@/lib/types";

type Step = "landing" | "input" | "loading" | "result" | "error";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [result, setResult] = useState<AnalyzeSuccess | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function analyze(input: SajuInput) {
    setStep("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      {step === "landing" && <Landing onStart={() => setStep("input")} />}

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

function Landing({ onStart }: { onStart: () => void }) {
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

      <button className="btn btn-primary" onClick={onStart}>
        내 운동 팔자 확인하기
      </button>

      <p className="disclaimer">
        회원가입 없이 바로 확인할 수 있어요.
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
