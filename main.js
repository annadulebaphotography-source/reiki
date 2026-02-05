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
  if (!res.ok) throw new Error(`Nie mogę wczytać: ${url} (${res.status})`);

  el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadPart("#site-header", "/header.html");
    await loadPart("#site-footer", "/footer.html");

    initBurger();
  } catch (e) {
    console.error(e);
  }
});
// --- HERO subtle motion: move inline background-image into CSS var for animation ---
(function(){
  function extractUrl(bg){
    // bg wygląda jak: url("annadulebareiki.jpg")
    const m = bg && bg.match(/url\(["']?(.*?)["']?\)/i);
    return m ? m[1] : "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".hero-top").forEach(hero => {
      // 1) bierzemy background-image z inline style albo z computed style
      const inlineBg = hero.style.backgroundImage;
      const computedBg = getComputedStyle(hero).backgroundImage;

      const url = extractUrl(inlineBg) || extractUrl(computedBg);
      if(!url) return;

      // 2) ustawiamy CSS variable, którą używa ::before
      hero.style.setProperty("--hero-img", `url("${url}")`);

      // 3) czyścimy normalne tło, żeby nie było podwójnie
     
    });
  });
})();
