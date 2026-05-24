import { db, doc, getDoc } from "./firebase.js";

const PAGE_ALIASES = {
  "": "home",
  "index": "home",
  "index.html": "home",
  "home": "home",
  "angebot": "angebot",
  "angebot.html": "angebot",
  "ueber-mich": "uber-mich",
  "ueber-mich.html": "uber-mich",
  "uber-mich": "uber-mich",
  "worum": "worum",
  "worum.html": "worum",
  "kontakt": "kontakt",
  "kontakt.html": "kontakt"
};

function inferPageId() {
  const fromBody = document.body?.dataset.page || "";
  const fileName = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  return PAGE_ALIASES[fromBody] || PAGE_ALIASES[fileName] || fromBody || "home";
}

function applyValue(el, value) {
  if (typeof value !== "string") return;
  if (el.matches("input, textarea")) el.value = value;
  else el.textContent = value;
}

function readFallbackContent() {
  return [...document.querySelectorAll("[data-cms]")].reduce((acc, el) => {
    const key = el.dataset.cms;
    if (!key) return acc;
    acc[key] = el.matches("input, textarea") ? el.value.trim() : el.textContent.trim();
    return acc;
  }, {});
}

export const currentPageId = inferPageId();
export const pageRef = doc(db, "pages", currentPageId);
export let currentPageData = {};

export async function loadPageContent() {
  const editableNodes = document.querySelectorAll("[data-cms]");
  if (!editableNodes.length) return {};

  try {
    const snap = await getDoc(pageRef);
    if (!snap.exists()) {
      currentPageData = readFallbackContent();
      document.dispatchEvent(new CustomEvent("cms:content-loaded", { detail: currentPageData }));
      return currentPageData;
    }

    currentPageData = snap.data() || {};
    editableNodes.forEach((el) => applyValue(el, currentPageData[el.dataset.cms]));
    document.dispatchEvent(new CustomEvent("cms:content-loaded", { detail: currentPageData }));
    return currentPageData;
  } catch (error) {
    console.error("Firestore content load failed:", error);
    currentPageData = readFallbackContent();
    document.dispatchEvent(new CustomEvent("cms:content-error", { detail: error }));
    return currentPageData;
  }
}

document.addEventListener("DOMContentLoaded", loadPageContent);
