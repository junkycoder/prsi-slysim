// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import {
  getAuth,
  connectAuthEmulator,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js";

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

export const fn = getFunctions(app, "europe-west1");
if (isEmulation) connectFunctionsEmulator(fn, "localhost", 5001);