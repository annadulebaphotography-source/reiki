import { auth, updateDoc, setDoc, onAuthStateChanged } from "./firebase.js";
import { pageRef } from "./content.js";

const ADMIN_EMAILS = ["annadulebaphotography@gmail.com"];

function isAdmin(user) {
  if (!user?.email) return false;
  return ADMIN_EMAILS.map((email) => email.toLowerCase()).includes(user.email.toLowerCase());
}

let activeUser = null;
let editing = false;
let saveTimer = null;

function cmsNodes() {
  return [...document.querySelectorAll("[data-cms]")];
}

function ensureToolbar() {
  let bar = document.querySelector(".cms-adminbar");
  if (bar) return bar;

  bar = document.createElement("div");
  bar.className = "cms-adminbar";
  bar.innerHTML = `
    <span class="cms-adminbar__status">Admin mode</span>
    <button type="button" class="cms-adminbar__edit">Bearbeiten</button>
    <button type="button" class="cms-adminbar__save" hidden>Speichern</button>
    <button type="button" class="cms-adminbar__cancel" hidden>Fertig</button>
    <button type="button" class="cms-adminbar__logout">Logout</button>
  `;
  document.body.appendChild(bar);

  bar.querySelector(".cms-adminbar__edit").addEventListener("click", () => setEditing(true));
  bar.querySelector(".cms-adminbar__cancel").addEventListener("click", () => setEditing(false));
  bar.querySelector(".cms-adminbar__save").addEventListener("click", saveContent);
  bar.querySelector(".cms-adminbar__logout").addEventListener("click", () => window.logoutGoogle?.());
  return bar;
}

function setToolbarState() {
  const bar = ensureToolbar();
  bar.classList.toggle("is-editing", editing);
  bar.querySelector(".cms-adminbar__edit").hidden = editing;
  bar.querySelector(".cms-adminbar__save").hidden = !editing;
  bar.querySelector(".cms-adminbar__cancel").hidden = !editing;
}

function makeEditable(el) {
  if (el.matches("input, textarea")) el.readOnly = !editing;
  else el.contentEditable = editing ? "true" : "false";
  el.classList.toggle("cms-editable", editing);
}

function setEditing(nextState) {
  editing = nextState;
  cmsNodes().forEach(makeEditable);
  document.body.classList.toggle("cms-editing", editing);
  setToolbarState();
}

function collectContent() {
  return cmsNodes().reduce((data, el) => {
    const key = el.dataset.cms;
    if (!key) return data;
    data[key] = el.matches("input, textarea") ? el.value.trim() : el.textContent.trim();
    return data;
  }, {});
}

async function saveContent() {
  if (!activeUser) return;
  const bar = ensureToolbar();
  const status = bar.querySelector(".cms-adminbar__status");
  const saveButton = bar.querySelector(".cms-adminbar__save");

  try {
    saveButton.disabled = true;
    status.textContent = "Speichert...";
    const data = collectContent();
    try {
      await updateDoc(pageRef, data);
    } catch (error) {
      if (error?.code !== "not-found") throw error;
      await setDoc(pageRef, data, { merge: true });
    }
    status.textContent = "Gespeichert";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => { status.textContent = "Admin mode"; }, 1800);
  } catch (error) {
    console.error("Firestore content save failed:", error);
    status.textContent = "Fehler beim Speichern";
    alert("Speichern nicht moeglich. Bitte Firestore-Regeln und Admin-Zugang pruefen.");
  } finally {
    saveButton.disabled = false;
  }
}

function enableAdmin(user) {
  activeUser = user;
  document.body.classList.add("cms-admin");
  ensureToolbar();
  setEditing(false);
}

function disableAdmin() {
  activeUser = null;
  editing = false;
  document.body.classList.remove("cms-admin", "cms-editing");
  cmsNodes().forEach(makeEditable);
  document.querySelector(".cms-adminbar")?.remove();
}

onAuthStateChanged(auth, (user) => {
  if (isAdmin(user)) enableAdmin(user);
  else disableAdmin();
});

document.addEventListener("click", (event) => {
  if (!editing) return;
  const editableLink = event.target.closest("a[data-cms]");
  if (editableLink) event.preventDefault();
}, true);

// Prevent link navigation while editing editable button labels.
document.addEventListener("input", (event) => {
  if (!editing || !event.target.closest("[data-cms]")) return;
  ensureToolbar().querySelector(".cms-adminbar__status").textContent = "Ungespeicherte Aenderungen";
});
