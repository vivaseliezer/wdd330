export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = true,
) {
  if (!parentElement) return;
  if (clear) {
    parentElement.innerHTML = "";
  }
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function updateFavoriteBadge() {
  const badge = document.getElementById("fav-count-badge");
  if (!badge) return;
  const favs = getLocalStorage("tc-favorites", []);
  badge.textContent = Array.isArray(favs) ? favs.length : 0;
  badge.classList.remove("badge-pulse");
  void badge.offsetWidth;
  badge.classList.add("badge-pulse");
}

export async function loadHeaderFooter(basePath = ".") {
  const headerEl = document.getElementById("main-header");
  const footerEl = document.getElementById("main-footer");
  try {
    if (headerEl) {
      const res = await fetch(`${basePath}/public/partials/header.html`);
      if (res.ok) {
        headerEl.innerHTML = await res.text();
        updateFavoriteBadge();
      }
    }
    if (footerEl) {
      const res = await fetch(`${basePath}/public/partials/footer.html`);
      if (res.ok) {
        footerEl.innerHTML = await res.text();
      }
    }
  } catch (err) {
    console.error("Header/footer load error:", err);
  }
}

export function alertMessage(message, type = "info", scroll = false) {
  const main = document.querySelector("main");
  if (!main) return;

  const existing = main.querySelector(".alert-banner");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = `alert-banner alert-banner--${type}`;
  div.innerHTML = `<p>${message}</p><button type="button" class="alert-close" aria-label="Close alert">&times;</button>`;
  div.querySelector(".alert-close").addEventListener("click", () => div.remove());

  main.prepend(div);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}
