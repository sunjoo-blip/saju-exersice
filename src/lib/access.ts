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
