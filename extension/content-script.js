(() => {
  // api.ts
  async function fetchSuggestion(context, label) {
    try {
      const res = await fetch(
        `https://mate-x.flowtest.info/ai-input-extension/api/suggest?context=${context}&label=${label}`
      );
      if (!res.ok) throw new Error("\uCD94\uCC9C \uC694\uCCAD \uC2E4\uD328");
      const data = await res.json();
      return data.suggestion || "";
    } catch (e) {
      return "";
    }
  }
  async function fetchSummary(text) {
    try {
      const res = await fetch(
        `https://mate-x.flowtest.info/ai-input-extension/api/summarize?text=${text}`
      );
      if (!res.ok) throw new Error("\uC694\uC57D \uC694\uCCAD \uC2E4\uD328");
      const data = await res.json();
      return data.summary || "";
    } catch (e) {
      return "";
    }
  }

  // util.ts
  function getSelectedText() {
    const selection = window.getSelection();
    return selection && !selection.isCollapsed ? selection.toString() : "";
  }
  function getSelectionCoords() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return null;
    const range = selection.getRangeAt(0);
    const endRange = range.cloneRange();
    endRange.collapse(false);
    let rect = endRange.getBoundingClientRect();
    if (rect.x === 0 && rect.y === 0 || rect.width === 0 && rect.height === 0) {
      const span = document.createElement("span");
      span.appendChild(document.createTextNode("\u200B"));
      endRange.insertNode(span);
      rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return { x: rect.right, y: rect.top + rect.height / 2 };
  }
  function createFloatingSummaryButtonAt(x, y, onClick) {
    const button = document.createElement("button");
    button.textContent = "\uC694\uC57D";
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
  function removeFloatingButton() {
    const btn = document.querySelector("button[data-ai-floating-summary]");
    if (btn) btn.remove();
    const spinner = document.querySelector("div[data-ai-spinner]");
    if (spinner) spinner.remove();
  }
  function createFloatingCleanButton(input, onClick) {
    const caret = getCaretCoords(input);
    const rect = input.getBoundingClientRect();
    const button = document.createElement("button");
    button.textContent = "\uC815\uB9AC";
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
  function removeFloatingCleanButton() {
    const btn = document.querySelector("button[data-ai-floating-clean]");
    if (btn) btn.remove();
    const spinner = document.querySelector("div[data-ai-clean-spinner]");
    if (spinner) spinner.remove();
  }
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function preventPopupCloseOnInsideClick(popup) {
    popup.addEventListener(
      "mousedown",
      (ev) => {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      },
      true
    );
  }
  function getCaretCoords(input) {
    if (input.isContentEditable) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return null;
      const caretRange = range.cloneRange();
      caretRange.collapse(true);
      let rect = caretRange.getBoundingClientRect();
      if (rect.x === 0 && rect.y === 0 || rect.width === 0 && rect.height === 0) {
        const span = document.createElement("span");
        span.appendChild(document.createTextNode("\u200B"));
        caretRange.insertNode(span);
        rect = span.getBoundingClientRect();
        span.parentNode?.removeChild(span);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return { x: rect.right, y: rect.top + rect.height / 2 };
    }
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      const el = input;
      const { selectionStart } = el;
      if (selectionStart == null) return null;
      const rect = el.getBoundingClientRect();
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
        "whiteSpace"
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
      let value = el.value;
      if (el instanceof HTMLTextAreaElement) {
        div.style.width = `${rect.width}px`;
      }
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionStart);
      const span = document.createElement("span");
      span.textContent = "\u200B";
      div.textContent = before;
      div.appendChild(span);
      if (el instanceof HTMLTextAreaElement && after.includes("\n")) {
        div.appendChild(document.createTextNode(after));
      }
      document.body.appendChild(div);
      const spanRect = span.getBoundingClientRect();
      document.body.removeChild(div);
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

  // content-script.ts
  function showResultPopupBelowInput(input, content, isLoading, onApply, onCancel) {
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
      popup.innerHTML = `<div style="text-align:center;">\uB85C\uB529 \uC911...</div>`;
    } else {
      popup.innerHTML = `
      <div style="margin-bottom: 12px;" data-ai-popup-content>${escapeHTML(
        content
      )}</div>
      <div style="text-align: right;">
        <button data-ai-popup-apply style="margin-right: 8px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #5377c0; color: #fff; cursor: pointer;">\uC801\uC6A9</button>
        <button data-ai-popup-cancel style="padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">\uB2EB\uAE30</button>
      </div>
    `;
    }
    document.body.appendChild(popup);
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
      popup.querySelector("[data-ai-popup-apply]")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onApply(content);
        removeResultPopup();
        document.removeEventListener("mousedown", clickOutside, true);
      });
      popup.querySelector("[data-ai-popup-cancel]")?.addEventListener("click", (ev) => {
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
    function clickOutside(ev) {
      const popup2 = document.querySelector("div[data-ai-result-popup]");
      if (popup2 && !popup2.contains(ev.target)) {
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
  function isInputElement(el) {
    return el instanceof HTMLInputElement;
  }
  function isTextAreaElement(el) {
    return el instanceof HTMLTextAreaElement;
  }
  function isContentEditableElement(el) {
    return el instanceof HTMLElement && el.isContentEditable;
  }
  function handleInputFocusOrInput(e) {
    removeFloatingCleanButton();
    const input = e.target;
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
      let text2 = "";
      if (isInputElement(input) || isTextAreaElement(input)) {
        text2 = input.value;
      } else if (isContentEditableElement(input)) {
        text2 = input.textContent || "";
      }
      if (!text2) return;
      button.style.display = "none";
      showResultPopupBelowInput(
        input,
        "",
        true,
        () => {
        },
        () => {
        }
      );
      const context = document.title + " " + window.location.hostname;
      try {
        const suggestion = await fetchSuggestion(context, text2);
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
    function cleanup() {
      removeFloatingCleanButton();
      input.removeEventListener("blur", cleanup);
      input.removeEventListener("focusout", cleanup);
      input.removeEventListener("keydown", onKeydown);
      observer.disconnect();
    }
    function onKeydown(ev) {
      const kev = ev;
      if (kev.key === "Escape") cleanup();
    }
    input.addEventListener("blur", cleanup);
    input.addEventListener("focusout", cleanup);
    input.addEventListener("keydown", onKeydown);
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
  function adjustPopupPosition(popup, x, y) {
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
  function createSummaryPopupAt(x, y, getSummary) {
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
    <div data-ai-summary-result style="margin-bottom: 12px;">\uB85C\uB529\uC911...</div>
    <div style="text-align: right;">
      <button data-ai-summary-copy style="margin-right: 8px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">\uBCF5\uC0AC</button>
      <button data-ai-summary-close style="padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db; background: #f3f4f6; cursor: pointer;">\uB2EB\uAE30</button>
    </div>
  `;
    document.body.appendChild(popup);
    adjustPopupPosition(popup, x, y);
    popup.addEventListener("mousedown", (ev) => ev.stopPropagation());
    popup.querySelector("[data-ai-summary-copy]")?.addEventListener("click", () => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        navigator.clipboard.writeText(resultEl.textContent || "");
      }
      removeSummaryPopup();
    });
    popup.querySelector("[data-ai-summary-close]")?.addEventListener("click", removeSummaryPopup);
    getSummary().then((result) => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        resultEl.textContent = result;
        adjustPopupPosition(popup, x, y);
      }
    }).catch((error) => {
      const resultEl = popup.querySelector("[data-ai-summary-result]");
      if (resultEl) {
        resultEl.textContent = "\uC694\uC57D\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
        adjustPopupPosition(popup, x, y);
      }
    });
  }
  function removeSummaryPopup() {
    const popup = document.querySelector("div[data-ai-summary-popup]");
    if (popup) popup.remove();
  }
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
      createFloatingSummaryButtonAt(coords.x, coords.y, async () => {
        removeFloatingButton();
        try {
          createSummaryPopupAt(
            coords.x,
            coords.y,
            async () => fetchSummary(text)
          );
        } catch {
          removeResultPopup();
        }
      });
      document.addEventListener("keydown", function escListener(ev) {
        if (ev.key === "Escape") {
          removeFloatingButton();
          document.removeEventListener("keydown", escListener);
        }
      });
      document.addEventListener("selectionchange", removeFloatingButton, {
        once: true
      });
      window.addEventListener("scroll", removeFloatingButton, { once: true });
      document.addEventListener("mousedown", function clickOutside(ev) {
        const popup = document.querySelector(
          "div[data-ai-summary-popup], div[data-ai-result-popup]"
        );
        if (popup && !popup.contains(ev.target)) {
          removeFloatingButton();
          document.removeEventListener("mousedown", clickOutside);
        }
      });
    }, 0);
  });
  function observeInputsForCleanButton() {
    function isInputEl(el) {
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLElement && el.isContentEditable;
    }
    function addListeners(el) {
      if (!isInputEl(el)) return;
      el.addEventListener("focus", handleInputFocusOrInput);
      el.addEventListener("input", handleInputFocusOrInput);
    }
    document.querySelectorAll(
      'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable="true"]'
    ).forEach(addListeners);
    const observer = new MutationObserver((muts) => {
      muts.forEach((mut) => {
        mut.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (isInputEl(node)) addListeners(node);
            node.querySelectorAll?.(
              'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable="true"]'
            ).forEach(addListeners);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  setTimeout(() => {
    observeInputsForCleanButton();
  }, 1e3);
})();
