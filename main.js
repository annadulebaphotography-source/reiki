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

function initReikiHeroMotion() {
  const canvases = document.querySelectorAll(".reiki-hero-motion");
  if (!canvases.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  canvases.forEach((canvas) => {
    if (canvas.dataset.motionReady === "true") return;
    canvas.dataset.motionReady = "true";

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const hero = canvas.closest(".sig-strip");
    if (!hero) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let easedX = 0;
    let easedY = 0;

    const stems = [
      { x: .07, y: .93, h: .62, curve: .08, pod: .32, phase: .1 },
      { x: .105, y: .93, h: .72, curve: .025, pod: .20, phase: 1.2 },
      { x: .135, y: .94, h: .62, curve: .035, pod: .30, phase: 2.2 },
      { x: .17, y: .93, h: .52, curve: .11, pod: .34, phase: 2.9 }
    ];

    const seeds = Array.from({ length: 22 }, (_, index) => ({
      offset: index / 22,
      x: .215 + Math.random() * .12,
      y: .29 + Math.random() * .16,
      size: 1.2 + Math.random() * 2.5,
      driftX: 16 + Math.random() * 72,
      driftY: 10 + Math.random() * 48,
      phase: Math.random() * Math.PI * 2,
      alpha: .055 + Math.random() * .075
    }));

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    }

    function podPath(cx, cy, r, sway) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * .72, r, sway, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * .82);
        ctx.quadraticCurveTo(cx + i * r * .14, cy, cx + i * r * .06, cy + r * .82);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy - r * .92, r * .36, Math.PI * .08, Math.PI * .92);
      ctx.stroke();
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      const t = time * 0.00012;
      const motionScale = reduceMotion.matches ? 0 : 1;
      const mouseDrift = (easedX * 2.5 + easedY * 1.5) * motionScale;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(92, 75, 68, .105)";
      ctx.lineWidth = Math.max(.55, width * .00042);

      stems.forEach((stem, index) => {
        const sway = Math.sin(t + stem.phase) * 3.2 * motionScale + mouseDrift;
        const baseX = width * stem.x;
        const baseY = height * stem.y;
        const topX = width * (stem.x + stem.curve) + sway;
        const topY = height * stem.pod;
        const ctrlX = width * (stem.x + stem.curve * .38) + sway * .45;
        const ctrlY = height * (stem.y - stem.h * .42);

        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, topX, topY);
        ctx.stroke();

        const r = Math.max(15, Math.min(width, height) * (.036 + index * .003));
        podPath(topX, topY - r * .12, r, sway * .003);
      });

      seeds.forEach((seed) => {
        const loop = (time * 0.000018 + seed.offset) % 1;
        const fade = Math.sin(loop * Math.PI);
        if (fade <= 0) return;
        const x = width * seed.x + seed.driftX * loop + Math.sin(seed.phase + time * 0.00028) * 4;
        const y = height * seed.y + seed.driftY * loop;
        const alpha = seed.alpha * fade * (reduceMotion.matches ? .45 : 1);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(seed.phase + loop * Math.PI * .8);
        ctx.strokeStyle = `rgba(92, 75, 68, ${alpha})`;
        ctx.fillStyle = `rgba(248, 240, 234, ${alpha * .42})`;
        ctx.lineWidth = .55;
        ctx.beginPath();
        ctx.ellipse(0, 0, seed.size, seed.size * .66, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      ctx.restore();
    }

    function animate(time) {
      easedX += (mouseX - easedX) * 0.03;
      easedY += (mouseY - easedY) * 0.03;
      draw(time);
      rafId = window.requestAnimationFrame(animate);
    }

    function start() {
      window.cancelAnimationFrame(rafId);
      if (reduceMotion.matches) {
        draw(0);
        return;
      }
      rafId = window.requestAnimationFrame(animate);
    }

    resize();
    start();

    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - .5) * 2;
      mouseY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - .5) * 2;
    }, { passive: true });

    hero.addEventListener("mouseleave", () => {
      mouseX = 0;
      mouseY = 0;
    }, { passive: true });

    window.addEventListener("resize", resize, { passive: true });
    reduceMotion.addEventListener?.("change", start);
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
  initReikiHeroMotion();

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
