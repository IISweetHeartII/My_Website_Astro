/**
 * JSON-LD 직렬화.
 *
 * `<script type="application/ld+json">` 안의 텍스트는 HTML 엔티티를 디코드하지 않는다.
 * 그래서 Astro의 `set:text`(HTML 이스케이프)로 넣으면 `&quot;`가 그대로 남아 JSON이 깨지고
 * 검색엔진이 스키마를 무시한다(2026-08-19 라이브에서 Person/WebSite 파싱 실패 확인).
 *
 * 반드시 `set:html={serializeJsonLd(obj)}` 로 넣는다. 스크립트 조기 종료(`</script>`)와
 * 유니코드 라인 구분자만 이스케이프하면 안전하다(JSON 문자열 안에서는 유효한 이스케이프).
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
