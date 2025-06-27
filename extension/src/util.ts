import { InputElement } from "./types";

/**
 * 입력창을 모두 탐지 (input, textarea, contenteditable)
 */
function findInputElements(): InputElement[] {
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[type="text"], input:not([type])'
    )
  );
  const textareas = Array.from(
    document.querySelectorAll<HTMLTextAreaElement>("textarea")
  );
  const editables = Array.from(
    document.querySelectorAll<HTMLElement>("[contenteditable]")
  ).filter((el) => el.isContentEditable) as (HTMLElement & {
    isContentEditable: true;
  })[];
  return [...inputs, ...textareas, ...editables];
}

/**
 * CSS 스피너 생성
 */
export function createSpinner(): HTMLDivElement {
  const spinner = document.createElement("div");
  spinner.style.display = "inline-block";
  spinner.style.width = "18px";
  spinner.style.height = "18px";
  spinner.style.verticalAlign = "middle";
  spinner.style.border = "2px solid #fff";
  spinner.style.borderTop = "2px solid #5377c0";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "ai-spin 0.7s linear infinite";
  spinner.style.margin = "0 4px";
  spinner.setAttribute("data-ai-spinner", "true");
  // CSS keyframes 동적 삽입 (최초 1회)
  if (!document.getElementById("ai-spinner-style")) {
    const style = document.createElement("style");
    style.id = "ai-spinner-style";
    style.textContent = `@keyframes ai-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
  return spinner;
}

/**
 * 선택된 텍스트가 실제로 존재하는지 확인
 */
export function getSelectedText(): string {
  const selection = window.getSelection();
  return selection && !selection.isCollapsed ? selection.toString() : "";
}

/**
 * 선택 영역의 마지막 커서(드래그 끝) 좌표 반환 (마우스 커서 근처)
 */
export function getSelectionCoords(): { x: number; y: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return null;
  const range = selection.getRangeAt(0);
  // endContainer/endOffset 기준 0-length range 생성
  const endRange = range.cloneRange();
  endRange.collapse(false); // 끝으로 이동
  let rect = endRange.getBoundingClientRect();
  // 빈 rect일 경우(특히 contenteditable) fallback
  if (
    (rect.x === 0 && rect.y === 0) ||
    (rect.width === 0 && rect.height === 0)
  ) {
    const span = document.createElement("span");
    span.appendChild(document.createTextNode("\u200b"));
    endRange.insertNode(span);
    rect = span.getBoundingClientRect();
    span.parentNode?.removeChild(span);
    // range 복구
    selection.removeAllRanges();
    selection.addRange(range);
  }
  return { x: rect.right, y: rect.top + rect.height / 2 };
}

/**
 * CSS 스피너 생성 (버튼 위치에)
 */
export function createSpinnerAt(x: number, y: number): HTMLDivElement {
  const spinner = createSpinner();
  spinner.style.position = "fixed";
  spinner.style.left = `${x + 8}px`;
  spinner.style.top = `${y - 16}px`;
  spinner.style.zIndex = "2147483647";
  document.body.appendChild(spinner);
  return spinner;
}

/**
 * floating 요약 버튼 생성 (선택 영역 근처)
 */
export function createFloatingSummaryButtonAt(
  x: number,
  y: number,
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = "요약";
  button.setAttribute("data-ai-floating-summary", "true");
  button.style.position = "fixed";
  button.style.left = `${x}px`;
  button.style.top = `${y - 16}px`;
  button.style.transform = "translateY(-50%)";
  button.style.background = "rgb(83 119 192)";
  button.style.color = "white";
  button.style.borderRadius = "4px";
  button.style.padding = "2px 8px";
  button.style.fontSize = "0.9em";
  button.style.cursor = "pointer";
  button.style.zIndex = "2147483647";
  button.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  button.addEventListener("click", onClick);
  document.body.appendChild(button);
  return button;
}

/**
 * floating 요약 버튼/스피너 제거
 */
export function removeFloatingButton() {
  const btn = document.querySelector("button[data-ai-floating-summary]");
  if (btn) btn.remove();
  const spinner = document.querySelector("div[data-ai-spinner]");
  if (spinner) spinner.remove();
}

/**
 * floating 정리 버튼 생성 (입력창 옆)
 */
export function createFloatingCleanButton(
  input: InputElement,
  onClick: () => void
): HTMLButtonElement {
  const caret = getCaretCoords(input);
  const rect = input.getBoundingClientRect();
  const button = document.createElement("button");
  button.textContent = "정리";
  button.setAttribute("data-ai-floating-clean", "true");
  button.style.position = "fixed";
  if (caret) {
    button.style.left = `${caret.x + 8}px`;
    button.style.top = `${caret.y - 16}px`;
    button.style.transform = "translateY(-50%)";
  } else {
    button.style.left = `${rect.right + 8}px`;
    button.style.top = `${rect.top + rect.height / 2 - 16}px`;
    button.style.transform = "translateY(-50%)";
  }
  button.style.background = "rgb(83 119 192)";
  button.style.color = "white";
  button.style.borderRadius = "4px";
  button.style.padding = "2px 8px";
  button.style.fontSize = "0.9em";
  button.style.cursor = "pointer";
  button.style.zIndex = "2147483647";
  button.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  button.addEventListener("click", onClick);
  document.body.appendChild(button);
  return button;
}

/**
 * floating 정리 버튼/스피너 제거
 */
export function removeFloatingCleanButton() {
  const btn = document.querySelector("button[data-ai-floating-clean]");
  if (btn) btn.remove();
  const spinner = document.querySelector("div[data-ai-clean-spinner]");
  if (spinner) spinner.remove();
}

/**
 * CSS 스피너 생성 (정리 버튼 위치)
 */
export function createCleanSpinnerAt(input: InputElement): HTMLDivElement {
  const rect = input.getBoundingClientRect();
  const spinner = createSpinner();
  spinner.style.position = "fixed";
  spinner.style.left = `${rect.right + 8}px`;
  spinner.style.top = `${rect.top + rect.height / 2 - 16}px`;
  spinner.style.zIndex = "2147483647";
  spinner.setAttribute("data-ai-clean-spinner", "true");
  document.body.appendChild(spinner);
  return spinner;
}

export function escapeHTML(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 팝업 내부 클릭 시 외부 클릭 감지 방지 (capture 단계에서 확실히 차단)
export function preventPopupCloseOnInsideClick(popup: HTMLElement) {
  popup.addEventListener(
    "mousedown",
    (ev) => {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    },
    true
  ); // capture 단계
}

// selection이 input/textarea/contenteditable 내부인지 확인
export function isInput() {
  let input: InputElement | null = null;
  const selection = window.getSelection();
  if (selection && selection.anchorNode) {
    let node = selection.anchorNode as HTMLElement | null;
    while (node) {
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement ||
        (node instanceof HTMLElement && node.isContentEditable)
      ) {
        input = node as InputElement;
        break;
      }
      node = node.parentElement;
    }
  }
  return input;
}

/**
 * 입력 커서(캐럿) 위치 반환 (input, textarea, contenteditable)
 */
export function getCaretCoords(
  input: InputElement
): { x: number; y: number } | null {
  // contenteditable
  if (input.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!range.collapsed) return null; // 입력 중이 아닐 때는 무시
    const caretRange = range.cloneRange();
    caretRange.collapse(true);
    let rect = caretRange.getBoundingClientRect();
    if (
      (rect.x === 0 && rect.y === 0) ||
      (rect.width === 0 && rect.height === 0)
    ) {
      // fallback: span 삽입
      const span = document.createElement("span");
      span.appendChild(document.createTextNode("\u200b"));
      caretRange.insertNode(span);
      rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
      // range 복구
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return { x: rect.right, y: rect.top + rect.height / 2 };
  }
  // input, textarea
  if (
    input instanceof HTMLInputElement ||
    input instanceof HTMLTextAreaElement
  ) {
    const el = input as HTMLInputElement | HTMLTextAreaElement;
    const { selectionStart } = el;
    if (selectionStart == null) return null;
    // input/textarea의 커서 위치를 구하려면, 동일한 스타일의 span을 만들어 caret 위치를 측정
    // 1. input/textarea의 값을 selectionStart까지 잘라 span에 넣음
    // 2. input/textarea의 위치(rect)와 scroll, padding, border 등 보정
    const rect = el.getBoundingClientRect();
    // 스타일 복사용 div 생성
    const div = document.createElement("div");
    const style = window.getComputedStyle(el);
    for (const prop of [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "textTransform",
      "textAlign",
      "direction",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "boxSizing",
      "lineHeight",
      "width",
      "height",
      "overflowX",
      "overflowY",
      "whiteSpace",
    ]) {
      div.style[prop] = style[prop];
    }
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.left = `${rect.left + window.scrollX}px`;
    div.style.top = `${rect.top + window.scrollY}px`;
    div.style.zIndex = "-9999";
    // 값 복사
    let value = el.value;
    if (el instanceof HTMLTextAreaElement) {
      div.style.width = `${rect.width}px`;
    }
    // selectionStart까지의 텍스트 + 커서 위치에 마커 span
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionStart);
    const span = document.createElement("span");
    span.textContent = "\u200b";
    div.textContent = before;
    div.appendChild(span);
    // textarea는 줄바꿈 보정
    if (el instanceof HTMLTextAreaElement && after.includes("\n")) {
      div.appendChild(document.createTextNode(after));
    }
    document.body.appendChild(div);
    const spanRect = span.getBoundingClientRect();
    document.body.removeChild(div);
    // input은 scrollLeft, textarea는 scrollTop/scrollLeft 보정
    let x = spanRect.left;
    let y = spanRect.top + spanRect.height / 2;
    if (el instanceof HTMLInputElement) {
      x -= el.scrollLeft;
    } else if (el instanceof HTMLTextAreaElement) {
      x -= el.scrollLeft;
      y -= el.scrollTop;
    }
    return { x, y };
  }
  return null;
}
