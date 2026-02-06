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

async function loadPart(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kann nicht geladen werden: ${url} (${res.status})`);

  el.innerHTML = await res.text();
}

/* ✅ REVEAL (sanftes Einblenden beim Scrollen) */
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

function isHomePage() {
  const p = window.location.pathname;
  // działa dla: /, /index.html, /reiki/, /reiki/index.html
  return p === "/" || p.endsWith("/index.html") || p.endsWith("/reiki/") || p.endsWith("/reiki/index.html");
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ✅ Header: nie ładuj na stronie głównej
    if (!isHomePage()) {
      await loadPart("#site-header", "/header.html");
      initBurger(); // burger ma sens tylko jeśli header istnieje
    }

    // ✅ Footer: wszędzie
    await loadPart("#site-footer", "/footer.html");

    initReveal();
  } catch (e) {
    console.error(e);
  }
});

// --- HERO subtle motion: move inline background-image into CSS var for animation ---
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
