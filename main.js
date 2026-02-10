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
  try {
    // ✅ W folderze /reiki/ muszą być ścieżki RELATYWNE
    await loadPart("#site-header", "header.html");
    await loadPart("#site-footer", "footer.html");

    initBurger();
    initReveal();
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
fetch("content.json")
  .then(response => response.json())
  .then(content => {

    // WORUM
    if (document.body.dataset.page === "worum") {
      const worum = content.worum;

      if (worum) {
        const h1 = document.getElementById("worum-h1");
        const intro = document.getElementById("worum-intro");
        const text1 = document.getElementById("worum-text1");
        const text2 = document.getElementById("worum-text2");

        if (h1) h1.textContent = worum.h1;
        if (intro) intro.textContent = worum.intro;
        if (text1) text1.textContent = worum.text1;
        if (text2) text2.textContent = worum.text2;
      }
    }

  })
  .catch(err => console.error("Content JSON error:", err));
