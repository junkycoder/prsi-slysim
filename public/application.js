// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import {
  getAuth,
  connectAuthEmulator,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import {
  getFirestore,
  connectFirestoreEmulator,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import {
  getFunctions,
  connectFunctionsEmulator,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js";

import { authCompleteEmailStoredLocally } from "/storage.js";

const isEmulation = location.hostname === "localhost";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBEk67mrYXdoxcw4SunCTt7zbxyd2N3164",
  authDomain: "prsi-slysim.firebaseapp.com",
  projectId: "prsi-slysim",
  storageBucket: "prsi-slysim.appspot.com",
  messagingSenderId: "203292680960",
  appId: "1:203292680960:web:272ab3ed3068e1748c09e5",
  measurementId: "G-6C0THMKVYV",
};

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export const app = initializeApp(firebaseConfig);
export const anal = getAnalytics(app);

export const auth = getAuth(app);
if (isEmulation) connectAuthEmulator(auth, "http://localhost:9099");

export const db = getFirestore(app);
if (isEmulation) connectFirestoreEmulator(db, "localhost", 8080);

export const fns = getFunctions(app, "europe-west1");
if (isEmulation) connectFunctionsEmulator(fns, "localhost", 5001);

async function handleSignInWithEmailLink(link) {
  let email = authCompleteEmailStoredLocally.read();

  if (!email) {
    alert(
      "Vypadá to, že chcete dokončit ověření uživatele v jiném prohlížeči než ve kterém jste začali. "
    );
    email = window.prompt(
      `Pokud chcete pokračovat v tompto prohlžeči, vyplně pro kontrolu svojí email adresu:`
    );
  }

  const { user } = await signInWithEmailLink(auth, email, link);
  authCompleteEmailStoredLocally.remove();

  if (!user?.emailVerified) {
    throw new Error("Sign in failed");
  }

  return user;
}

/**
 *
 * @param {string} href Complete URL of protected page
 */
export const restrictedLocation = async (currentHref) => {
  let user = auth.currentUser;

  if (!user) {
    user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });
  }

  if (!user?.emailVerified) {
    if (isSignInWithEmailLink(auth, currentHref)) {
      user = await handleSignInWithEmailLink(currentHref);
      user.newbie = true;
    }
  }

  return user;
};
