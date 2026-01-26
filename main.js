async function inject(id, file){
  const el = document.getElementById(id);
  if(!el) return;
  const res = await fetch(file, { cache: "no-cache" });
  el.innerHTML = await res.text();
}

function setActiveNav(){
  const key = document.body.getAttribute("data-page");
  if(!key) return;
  const link = document.querySelector(`a[data-nav="${key}"]`);
  if(link) link.classList.add("active");
}

function setYear(){
  const y = document.getElementById("y");
  if(y) y.textContent = new Date().getFullYear();
}

async function boot(){
  await inject("site-header", "header.html");
  await inject("site-footer", "footer.html");
  setActiveNav();
  setYear();
}

boot();
