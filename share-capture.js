(function () {
  const BUTTON_SELECTOR = "[data-share-capture]";
  const SHARE_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <path d="m8.59 13.51 6.83 3.98"></path>
      <path d="m15.41 6.51-6.82 3.98"></path>
    </svg>
  `;

  function enhanceShareButtons(root = document) {
    root.querySelectorAll?.(BUTTON_SELECTOR).forEach((button) => {
      if (button.disabled || button.querySelector("svg")) return;
      button.innerHTML = SHARE_ICON;
      button.setAttribute("aria-label", "Share screenshot");
      button.setAttribute("title", "Share screenshot");
    });
  }

  function slug(value) {
    return String(value || "waxball")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "waxball";
  }

  function copyComputedStyles(source, clone) {
    if (!(source instanceof Element) || !(clone instanceof Element)) return;
    const styles = getComputedStyle(source);
    for (const property of styles) clone.style.setProperty(property, styles.getPropertyValue(property), styles.getPropertyPriority(property));
    [...source.children].forEach((child, index) => copyComputedStyles(child, clone.children[index]));
  }

  function prepareClone(target, width) {
    const clone = target.cloneNode(true);
    copyComputedStyles(target, clone);
    const sourceSelects = [...target.querySelectorAll("select")];
    clone.querySelectorAll("select").forEach((select, index) => {
      const value = sourceSelects[index]?.value;
      [...select.options].forEach((option) => option.toggleAttribute("selected", option.value === value));
    });
    clone.querySelectorAll(`${BUTTON_SELECTOR}, .manager-rank-close`).forEach((node) => node.remove());
    clone.removeAttribute("id");
    clone.style.width = `${width}px`;
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.boxSizing = "border-box";
    return clone;
  }

  async function elementToPng(target) {
    await document.fonts?.ready;
    const rect = target.getBoundingClientRect();
    const width = Math.max(320, Math.ceil(rect.width));
    const clone = prepareClone(target, width);
    const measuringHost = document.createElement("div");
    measuringHost.className = "share-capture-measure";
    measuringHost.style.width = `${width}px`;
    measuringHost.appendChild(clone);
    document.body.appendChild(measuringHost);
    const height = Math.max(180, Math.ceil(clone.scrollHeight));
    measuringHost.remove();

    const wrapper = document.createElement("div");
    wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    wrapper.style.cssText = `width:${width}px;height:${height}px;background:#0d141d;color:#f5f8fb;overflow:hidden;`;
    wrapper.appendChild(clone);
    const markup = new XMLSerializer().serializeToString(wrapper);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
    const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

    try {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
      await image.decode();
      const scale = Math.min(2, 4096 / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Screenshot creation failed.")), "image/png"));
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  function targetFor(button) {
    const selector = button.dataset.shareTarget;
    if (selector) return document.querySelector(selector);
    return button.closest(".manager-rank-dialog, .manager-profile-card, .h2h-board, .h2h-rival-board");
  }

  function notify(message, isError = false) {
    let toast = document.querySelector("#share-capture-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "share-capture-toast";
      toast.className = "share-capture-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  async function share(button) {
    const target = targetFor(button);
    if (!target) return;
    const previousHtml = button.innerHTML;
    button.disabled = true;
    button.textContent = "CREATING...";
    try {
      const blob = await elementToPng(target);
      const title = button.dataset.shareTitle || target.getAttribute("aria-label") || document.title || "Waxball";
      const filename = `${slug(title)}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify("Screenshot downloaded");
      }
    } catch (error) {
      if (error?.name !== "AbortError") notify("Could not create screenshot", true);
    } finally {
      button.disabled = false;
      button.innerHTML = previousHtml;
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(BUTTON_SELECTOR);
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    share(button);
  });

  enhanceShareButtons();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(BUTTON_SELECTOR)) enhanceShareButtons(node.parentElement || document);
      else enhanceShareButtons(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
