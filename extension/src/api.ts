/**
 * 추천 문장 요청 (서버 API 연동)
 */
export async function fetchSuggestion(
  context: string,
  label: string
): Promise<string> {
  try {
    const res = await fetch(
      `https://mate-x.flowtest.info/ai-input-extension/api/suggest?context=${context}&label=${label}`
    );
    if (!res.ok) throw new Error("추천 요청 실패");
    const data = await res.json();
    return data.suggestion || "";
  } catch (e) {
    return "";
  }
}

/**
 * 요약 요청 (서버 API 연동)
 */
export async function fetchSummary(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://mate-x.flowtest.info/ai-input-extension/api/summarize?text=${text}`
    );
    if (!res.ok) throw new Error("요약 요청 실패");
    const data = await res.json();
    return data.summary || "";
  } catch (e) {
    return "";
  }
}
