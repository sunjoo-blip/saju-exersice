/** 상단 브랜드 줄: obud 로고 · 운동팔자 (+ 오른쪽 보조 요소) */
export default function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <header className="brand-row">
      <b className="persona-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/obud-logo.png" alt="" width={22} height={22} />
        <span className="persona-wordmark">obud</span>
        <span className="persona-brand-sub">· 운동팔자</span>
      </b>
      {right}
    </header>
  );
}
