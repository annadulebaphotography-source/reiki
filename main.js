function initBurger() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
    });
  });
}

function setFooterYear() {
  document.querySelectorAll("#y").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

async function loadPart(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kann nicht geladen werden: ${url} (${res.status})`);

  el.innerHTML = await res.text();
}

function shouldLoadAdminTools() {
  const params = new URLSearchParams(window.location.search);
  return ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
    params.has("admin") ||
    window.localStorage.getItem("showCmsLogin") === "1";
}

async function loadAdminTools() {
  if (document.querySelector('script[data-admin-tools="true"]')) return;

  await import("./content.js");

  const script = document.createElement("script");
  script.type = "module";
  script.src = "/admin.js";
  script.dataset.adminTools = "true";
  document.body.appendChild(script);
}

function initAdminLoader() {
  if (shouldLoadAdminTools()) {
    window.localStorage.setItem("showCmsLogin", "1");
    loadAdminTools().catch((error) => console.error("Admin tools failed:", error));
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "a") {
      window.localStorage.setItem("showCmsLogin", "1");
      loadAdminTools().catch((error) => console.error("Admin tools failed:", error));
    }
  });
}

function initPoppySeeds() {
  const fields = document.querySelectorAll("[data-seed-field]");
  if (!fields.length) return;

  fields.forEach((field) => {
    if (field.dataset.ready === "true") return;
    field.dataset.ready = "true";

    const count = window.matchMedia("(max-width: 720px)").matches ? 18 : 28;
    for (let i = 0; i < count; i += 1) {
      const seed = document.createElement("span");
      seed.className = "poppy-seed";
      seed.style.setProperty("--x", `${42 + Math.random() * 46}%`);
      seed.style.setProperty("--y", `${12 + Math.random() * 42}%`);
      seed.style.setProperty("--size", `${1.6 + Math.random() * 3.8}px`);
      seed.style.setProperty("--drift-x", `${-16 + Math.random() * 42}px`);
      seed.style.setProperty("--drift-y", `${48 + Math.random() * 96}px`);
      seed.style.setProperty("--duration", `${18 + Math.random() * 16}s`);
      seed.style.setProperty("--delay", `${Math.random() * -24}s`);
      seed.style.setProperty("--opacity", `${0.16 + Math.random() * 0.22}`);
      field.appendChild(seed);
    }
  });
}

/* ✅ REVEAL */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
}

document.addEventListener("DOMContentLoaded", async () => {
  initAdminLoader();
  initPoppySeeds();

  try {
    await loadPart("#site-header", "/header.html");
    await loadPart("#site-footer", "/footer.html");

    initBurger();
    initReveal();
    setFooterYear();
  } catch (e) {
    console.error(e);
  }
});

// --- HERO subtle motion ---
(function () {
  function extractUrl(bg) {
    const m = bg && bg.match(/url\(["']?(.*?)["']?\)/i);
    return m ? m[1] : "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".hero-top").forEach(hero => {
      const inlineBg = hero.style.backgroundImage;
      const computedBg = getComputedStyle(hero).backgroundImage;

      const url = extractUrl(inlineBg) || extractUrl(computedBg);
      if (!url) return;

      hero.style.setProperty("--hero-img", `url("${url}")`);
    });
  });
})();
