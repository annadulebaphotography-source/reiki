import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMzTGDQq8kLbIlZxPyYmWPub8iTD4tpY8",
  authDomain: "reiki-webseite.firebaseapp.com",
  projectId: "reiki-webseite",
  storageBucket: "reiki-webseite.firebasestorage.app",
  messagingSenderId: "826618385889",
  appId: "1:826618385889:web:e14c1b301a33b7673deea0",
  measurementId: "G-PZBR7Z7JLF"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export { doc, getDoc, setDoc, updateDoc, onAuthStateChanged, signInWithPopup, signOut };

window.loginGoogle = async function () {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

window.logoutGoogle = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
