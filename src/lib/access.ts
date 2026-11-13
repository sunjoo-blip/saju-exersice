/**
 * 접속 코드 게이트 (OpenAI 비용 보호).
 * - ACCESS_CODES 환경변수(쉼표로 여러 개 가능)에 허용 코드를 넣습니다.
 * - 클라이언트는 x-access-code 헤더로 코드를 보냅니다.
 * - ACCESS_CODES 가 비어 있으면 게이트를 끕니다(로컬 개발용). 배포 시 반드시 설정하세요.
 */
export function isAllowed(req: Request): boolean {
  const raw = process.env.ACCESS_CODES?.trim();
  if (!raw) return true;
  const allowed = new Set(
    raw.split(",").map((c) => c.trim()).filter(Boolean),
  );
  const provided = req.headers.get("x-access-code")?.trim() ?? "";
  return provided.length > 0 && allowed.has(provided);
}

/**
 * IP 하루 제한 '면제' 코드인지 확인.
 * - IP_EXEMPT_CODES(쉼표로 여러 개) 에 해당하는 코드로 들어온 요청은 IP 백스톱을 건너뜁니다.
 *   (같은 와이파이의 여러 사람이 각자 브라우저당 하루 1회 이용할 수 있게 — 행사/사무실용)
 * - 브라우저당 하루 제한은 그대로 적용됩니다.
 */
export function isIpLimitExempt(req: Request): boolean {
  const raw = process.env.IP_EXEMPT_CODES?.trim();
  if (!raw) return false;
  const exempt = new Set(
    raw.split(",").map((c) => c.trim()).filter(Boolean),
  );
  const provided = req.headers.get("x-access-code")?.trim() ?? "";
  return provided.length > 0 && exempt.has(provided);
}
