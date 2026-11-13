/**
 * 접속 코드 게이트 (OpenAI 비용 보호).
 * - ACCESS_CODES 환경변수(쉼표로 여러 개 가능)에 허용 코드를 넣습니다. (한글 코드도 허용)
 * - 클라이언트는 x-access-code 헤더로 코드를 보냅니다.
 *   HTTP 헤더는 Latin-1 만 담을 수 있어, 한글 등 비ASCII 코드는 encodeURIComponent 로
 *   인코딩해서 보내고 여기서 디코딩합니다.
 * - ACCESS_CODES 가 비어 있으면 게이트를 끕니다(로컬 개발용). 배포 시 반드시 설정하세요.
 */

/** x-access-code 헤더를 읽어 디코딩 (한글 코드 지원). */
function readAccessCode(req: Request): string {
  const raw = req.headers.get("x-access-code") ?? "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim(); // 잘못된 인코딩이면 원문 그대로 비교
  }
}

function codeSet(raw: string | undefined): Set<string> {
  return new Set((raw ?? "").split(",").map((c) => c.trim()).filter(Boolean));
}

export function isAllowed(req: Request): boolean {
  const raw = process.env.ACCESS_CODES?.trim();
  if (!raw) return true;
  const provided = readAccessCode(req);
  return provided.length > 0 && codeSet(raw).has(provided);
}

/**
 * 하루 제한 '면제' 코드인지 확인.
 * - IP_EXEMPT_CODES(쉼표로 여러 개) 에 해당하는 코드로 들어온 요청은 레이트리밋을 무제한으로 건너뜁니다.
 *   (브라우저당·IP당 제한 모두 면제 — 행사/사무실/테스트용. 한 기기로 여러 번 돌려도 막히지 않음)
 * - 입장은 ACCESS_CODES 로 따로 검증하므로, 면제 코드도 ACCESS_CODES 에 포함돼 있어야 합니다.
 */
export function isIpLimitExempt(req: Request): boolean {
  const raw = process.env.IP_EXEMPT_CODES?.trim();
  if (!raw) return false;
  const provided = readAccessCode(req);
  return provided.length > 0 && codeSet(raw).has(provided);
}
