import { fetchSuggestion, fetchSummary } from "./api";
import { InputElement } from "./types";
import {
  createFloatingCleanButton,
  createFloatingSummaryButtonAt,
  escapeHTML,
  getSelectedText,
  getSelectionCoords,
  isInput,
  preventPopupCloseOnInsideClick,
  removeFloatingButton,
  removeFloatingCleanButton,
} from "./util";

/**
 * 입력창 아래에 결과/로딩 팝업 표시
 */
function showResultPopupBelowInput(
  input: InputElement,
  content: string,
  isLoading: boolean,
  onApply: (text: string) => void,
  onCancel: () => void
) {
  const rect = input.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.setAttribute("data-ai-result-popup", "true");
  popup.style.position = "fixed";
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom + 8}px`;
  popup.style.minWidth = `${Math.max(rect.width, 220)}px`;
  popup.style.maxWidth = "480px";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #d1d5db";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 16px rgba(0,0,0,0.13)";
  popup.style.padding = "16px 16px 12px 16px";
  popup.style.zIndex = "2147483647";
  popup.style.fontSize = "1em";
  popup.style.color = "#222";
  popup.style.lineHeight = "1.5";
  popup.style.wordBreak = "break-word";
  if (isLoading) {
    popup.innerHTML = `<div style="text-align:center;">로딩 중...</div>`;
  } else {
    popup.innerHTML = `
      <div style="margin-bottom: 12px;" data-ai-popup-content>${escapeHTML(
        content
      )}</div>
      <div style="text-align: right;">
        <button data-ai-popup-apply style="margin-right: 8px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #5377c0; color: #fff; cursor: pointer;">적용</button>
        <button data-ai-popup-cancel style="padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">닫기</button>
      </div>
    `;
  }
  document.body.appendChild(popup);
  // 팝업 위치 자동 조정 (뷰포트 밖 방지)
  const popupRect = popup.getBoundingClientRect();
  let newLeft = rect.left;
  let newTop = rect.bottom + 8;
  if (newLeft + popupRect.width > window.innerWidth - 8) {
    newLeft = window.innerWidth - popupRect.width - 8;
    if (newLeft < 8) newLeft = 8;
  }
  if (newTop + popupRect.height > window.innerHeight - 8) {
    newTop = rect.top - popupRect.height - 8;
    if (newTop < 8) newTop = 8;
  }
  popup.style.left = `${newLeft}px`;
  popup.style.top = `${newTop}px`;
  preventPopupCloseOnInsideClick(popup);
  if (!isLoading) {
    popup
      .querySelector("[data-ai-popup-apply]")
      ?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onApply(content);
        removeResultPopup();
        document.removeEventListener("mousedown", clickOutside, true);
      });
    popup
      .querySelector("[data-ai-popup-cancel]")
      ?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onCancel();
        removeResultPopup();
        document.removeEventListener("mousedown", clickOutside, true);
      });
  }

  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      removeResultPopup();
      document.removeEventListener("keydown", escListener);
      document.removeEventListener("mousedown", clickOutside, true);
    }
  });
  // input.addEventListener("blur", removeResultPopup, { once: true });
  // 팝업 외부 클릭 감지 (capture 단계)
  function clickOutside(ev: MouseEvent) {
    const popup = document.querySelector("div[data-ai-result-popup]");
    if (popup && !popup.contains(ev.target as Node)) {
      removeResultPopup();
      document.removeEventListener("mousedown", clickOutside, true);
    }
  }
  document.addEventListener("mousedown", clickOutside, true);
}

function removeResultPopup() {
  const popup = document.querySelector("div[data-ai-result-popup]");
  if (popup) popup.remove();
}

// 타입 가드 함수 추가
function isInputElement(el: any): el is HTMLInputElement {
  return el instanceof HTMLInputElement;
}
function isTextAreaElement(el: any): el is HTMLTextAreaElement {
  return el instanceof HTMLTextAreaElement;
}
function isContentEditableElement(el: any): el is HTMLElement {
  return el instanceof HTMLElement && el.isContentEditable;
}

/**
 * 입력창에 이벤트 리스너 등록 (input, textarea, contenteditable)
 */
function handleInputFocusOrInput(e: Event) {
  removeFloatingCleanButton();
  const input = e.target as InputElement;
  if (!input) return;

  let text = "";
  if (isInputElement(input) || isTextAreaElement(input)) {
    text = input.value;
  } else if (isContentEditableElement(input)) {
    text = input.textContent || "";
  }
  if (text.length < 5) {
    return;
  }

  const button = createFloatingCleanButton(input, async () => {
    let text = "";
    if (isInputElement(input) || isTextAreaElement(input)) {
      text = input.value;
    } else if (isContentEditableElement(input)) {
      text = input.textContent || "";
    }
    if (!text) return;
    button.style.display = "none";
    showResultPopupBelowInput(
      input,
      "",
      true,
      () => {},
      () => {}
    ); // 로딩

    const context = document.title + " " + window.location.hostname;
    try {
      const suggestion = await fetchSuggestion(context, text);
      removeResultPopup();
      showResultPopupBelowInput(
        input,
        suggestion,
        false,
        (result) => {
          if (isInputElement(input) || isTextAreaElement(input))
            input.value = result;
          else if (isContentEditableElement(input)) input.textContent = result;
          removeResultPopup();
        },
        () => {
          removeResultPopup();
        }
      );
    } catch {
      removeResultPopup();
    } finally {
      button.style.display = "";
    }
  });
  // cleanup: blur, focusout, ESC, DOM 제거
  function cleanup() {
    removeFloatingCleanButton();
    // removeResultPopup();
    input.removeEventListener("blur", cleanup);
    input.removeEventListener("focusout", cleanup);
    input.removeEventListener("keydown", onKeydown);
    observer.disconnect();
  }
  function onKeydown(ev: Event) {
    const kev = ev as KeyboardEvent;
    if (kev.key === "Escape") cleanup();
  }
  input.addEventListener("blur", cleanup);
  input.addEventListener("focusout", cleanup);
  input.addEventListener("keydown", onKeydown);
  // input DOM이 제거될 때도 cleanup
  const observer = new MutationObserver((muts) => {
    muts.forEach((mut) => {
      mut.removedNodes.forEach((node) => {
        if (node === input) cleanup();
      });
    });
  });
  if (input.parentElement) {
    observer.observe(input.parentElement, { childList: true });
  }
}

// --- 드래그 요약 팝업 ---

function adjustPopupPosition(popup: HTMLElement, x: number, y: number) {
  const popupRect = popup.getBoundingClientRect();
  let newLeft = x + 12;
  let newTop = y - 24;
  const minMargin = 8;
  if (newLeft + popupRect.width > window.innerWidth - minMargin) {
    newLeft = window.innerWidth - popupRect.width - minMargin;
    if (newLeft < minMargin) newLeft = minMargin;
  }
  if (newTop + popupRect.height > window.innerHeight - minMargin) {
    newTop = window.innerHeight - popupRect.height - minMargin;
    if (newTop < minMargin) newTop = minMargin;
  }
  popup.style.left = `${newLeft}px`;
  popup.style.top = `${newTop}px`;
}

/**
 * 요약 팝업 생성 (selection 근처)
 */
function createSummaryPopupAt(
  x: number,
  y: number,
  getSummary: () => Promise<string>
) {
  const popup = document.createElement("div");
  popup.setAttribute("data-ai-summary-popup", "true");
  popup.style.position = "fixed";
  popup.style.left = `${x + 12}px`;
  popup.style.top = `${y - 24}px`;
  popup.style.minWidth = "220px";
  popup.style.maxWidth = "360px";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #d1d5db";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 16px rgba(0,0,0,0.13)";
  popup.style.padding = "16px 16px 12px 16px";
  popup.style.zIndex = "2147483647";
  popup.style.fontSize = "1em";
  popup.style.color = "#222";
  popup.style.lineHeight = "1.5";
  popup.style.wordBreak = "break-word";
  popup.innerHTML = `
    <div data-ai-summary-result style="margin-bottom: 12px;">로딩중...</div>
    <div style="text-align: right;">
      <button data-ai-summary-copy style="margin-right: 8px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">복사</button>
      <button data-ai-summary-close style="padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">닫기</button>
    </div>
  `;
  document.body.appendChild(popup);

  // 최초 생성 시 위치 조정
  adjustPopupPosition(popup, x, y);

  // 팝업 내부 클릭 시 외부 클릭 감지 방지
  popup.addEventListener("mousedown", (ev) => ev.stopPropagation());
  // 복사 버튼
  popup
    .querySelector("[data-ai-summary-copy]")
    ?.addEventListener("click", () => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        navigator.clipboard.writeText(resultEl.textContent || "");
      }
      removeSummaryPopup();
    });
  // 닫기 버튼
  popup
    .querySelector("[data-ai-summary-close]")
    ?.addEventListener("click", removeSummaryPopup);

  getSummary()
    .then((result) => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        resultEl.textContent = result;
        // 요약 결과가 들어온 후 위치 재조정
        adjustPopupPosition(popup, x, y);
      }
    })
    .catch((error) => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        resultEl.textContent = "요약을 가져오는 중 오류가 발생했습니다.";
        adjustPopupPosition(popup, x, y);
      }
    });
}

function removeSummaryPopup() {
  const popup = document.querySelector("div[data-ai-summary-popup]");
  if (popup) popup.remove();
}

// --- 드래그 요약 이벤트 리스너 수정 ---
document.addEventListener("mouseup", () => {
  if (document.querySelector("button[data-ai-floating-summary]")) {
    return;
  }

  setTimeout(() => {
    removeFloatingButton();
    const text = getSelectedText();
    if (!text || text.trim().length < 2) return;
    const coords = getSelectionCoords();
    if (!coords) return;
    // floating 요약 버튼 생성
    createFloatingSummaryButtonAt(coords.x, coords.y, async () => {
      removeFloatingButton();

      try {
        createSummaryPopupAt(coords.x, coords.y, async () =>
          fetchSummary(text)
        );
      } catch {
        removeResultPopup();
      }
    });
    // ESC, selection 변경, 스크롤 등에서 버튼/스피너/팝업 제거
    document.addEventListener("keydown", function escListener(ev) {
      if (ev.key === "Escape") {
        removeFloatingButton();
        document.removeEventListener("keydown", escListener);
      }
    });
    document.addEventListener("selectionchange", removeFloatingButton, {
      once: true,
    });
    window.addEventListener("scroll", removeFloatingButton, { once: true });
    document.addEventListener("mousedown", function clickOutside(ev) {
      const popup = document.querySelector(
        "div[data-ai-summary-popup], div[data-ai-result-popup]"
      );
      if (popup && !popup.contains(ev.target as Node)) {
        removeFloatingButton();
        document.removeEventListener("mousedown", clickOutside);
      }
    });
  }, 0);
});

function observeInputsForCleanButton() {
  function isInputEl(el: Element): el is InputElement {
    return (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      (el instanceof HTMLElement && el.isContentEditable)
    );
  }
  function addListeners(el: Element) {
    if (!isInputEl(el)) return;
    el.addEventListener("focus", handleInputFocusOrInput);
    el.addEventListener("input", handleInputFocusOrInput);
  }
  // 최초 등록
  document
    .querySelectorAll(
      'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable="true"]'
    )
    .forEach(addListeners);
  // 동적 생성 감지
  const observer = new MutationObserver((muts) => {
    muts.forEach((mut) => {
      mut.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (isInputEl(node)) addListeners(node);
          node
            .querySelectorAll?.(
              'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable="true"]'
            )
            .forEach(addListeners);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- 입력창 정리 버튼 감지 시작 ---
setTimeout(() => {
  observeInputsForCleanButton();
}, 1000);

// --- 드래그 요약 팝업 개선 ---
function showSummaryBelowInput(input: InputElement, summary: string) {
  // removeResultPopup();
  const rect = input.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.setAttribute("data-ai-result-popup", "true");
  popup.style.position = "fixed";
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom + 8}px`;
  popup.style.minWidth = `${Math.max(rect.width, 220)}px`;
  popup.style.maxWidth = "480px";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #d1d5db";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 16px rgba(0,0,0,0.13)";
  popup.style.padding = "16px 16px 12px 16px";
  popup.style.zIndex = "2147483647";
  popup.style.fontSize = "1em";
  popup.style.color = "#222";
  popup.style.lineHeight = "1.5";
  popup.style.wordBreak = "break-word";
  popup.innerHTML = `
    <div style="margin-bottom: 12px;" data-ai-popup-content>${escapeHTML(
      summary
    )}</div>
    <div style="text-align: right;">
      <button data-ai-popup-apply style="margin-right: 8px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #5377c0; color: #fff; cursor: pointer;">수정</button>
      <button data-ai-popup-cancel style="padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">닫기</button>
    </div>
  `;
  document.body.appendChild(popup);
  // 팝업 위치 자동 조정 (뷰포트 밖 방지)
  const popupRect = popup.getBoundingClientRect();
  let newLeft = rect.left;
  let newTop = rect.bottom + 8;
  if (newLeft + popupRect.width > window.innerWidth - 8) {
    newLeft = window.innerWidth - popupRect.width - 8;
    if (newLeft < 8) newLeft = 8;
  }
  if (newTop + popupRect.height > window.innerHeight - 8) {
    newTop = rect.top - popupRect.height - 8;
    if (newTop < 8) newTop = 8;
  }
  popup.style.left = `${newLeft}px`;
  popup.style.top = `${newTop}px`;
  preventPopupCloseOnInsideClick(popup);
  popup
    .querySelector("[data-ai-popup-apply]")
    ?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if ("value" in input) input.value = summary;
      else if (input.isContentEditable) input.textContent = summary;
      removeResultPopup();
      document.removeEventListener("mousedown", clickOutside, true);
    });
  popup
    .querySelector("[data-ai-popup-cancel]")
    ?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      removeResultPopup();
      document.removeEventListener("mousedown", clickOutside, true);
    });
  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      removeResultPopup();
      document.removeEventListener("keydown", escListener);
      document.removeEventListener("mousedown", clickOutside, true);
    }
  });
  input.addEventListener("blur", removeResultPopup, { once: true });
  function clickOutside(ev: MouseEvent) {
    const popup = document.querySelector("div[data-ai-result-popup]");
    if (popup && !popup.contains(ev.target as Node)) {
      removeResultPopup();
      document.removeEventListener("mousedown", clickOutside, true);
    }
  }
  document.addEventListener("mousedown", clickOutside, true);
}
