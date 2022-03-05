import { auth } from "/application.js";
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { authCompleteEmailStoredLocally } from "/storage.js";

export const isVerifyLink = (link) => {
  return isSignInWithEmailLink(auth, link);
};

export const useVerifyLink = (link, email) => {
  return signInWithEmailLink(auth, email, link);
};

export const watchUser = (callback) => {
  onAuthStateChanged(auth, callback);
};
