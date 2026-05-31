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

async function loadAdminTools(options = {}) {
  if (document.querySelector('script[data-admin-tools="true"]')) {
    if (options.login) window.loginGoogle?.();
    return;
  }

  await import("./content.js");

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/admin.js";
    script.dataset.adminTools = "true";
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.body.appendChild(script);
  });

  if (options.login) window.loginGoogle?.();
}

function initAdminLoader() {
  if (shouldLoadAdminTools()) {
    window.localStorage.setItem("showCmsLogin", "1");
    loadAdminTools().catch((error) => console.error("Admin tools failed:", error));
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "a") {
      window.localStorage.setItem("showCmsLogin", "1");
      loadAdminTools({ login: true }).catch((error) => console.error("Admin tools failed:", error));
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
