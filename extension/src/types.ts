export interface SuggestRequest {
  context: string;
  label: string;
}

export interface SuggestResponse {
  suggestion: string;
}

export interface SummarizeRequest {
  text: string;
}

export interface SummarizeResponse {
  summary: string;
}

/**
 * 입력창 타입 정의
 */
export type InputElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | (HTMLElement & { isContentEditable: true });
