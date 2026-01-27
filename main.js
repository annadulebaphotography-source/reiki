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
