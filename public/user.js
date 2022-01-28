import { auth } from "/application.js";
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { authCompleteEmailStoredLocally } from "/storage.js";

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
    throw new Error("Verification failed");
  }

  return user;
}

/**
 *
 * @param {*} altloc
 */
export const redirectToVerification = (altloc) => {
  const location = altloc || window.location;
  const { pathname } = location;
  window.location.href = `/verifikace.html?back=${pathname}`;
};

export const currentUser = async (async) => {
  let user = auth.currentUser;

  if (!user) {
    user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });
  }

  return user;
};

export const onCurrentUserChanged = (callback) => {
  onAuthStateChanged(auth, callback);
};

/**
 *
 * @param {string} href Complete URL of protected page
 */
export const restrictedLocation = async (currentHref) => {
  let user = await currentUser();

  if (!user?.emailVerified) {
    if (isSignInWithEmailLink(auth, currentHref)) {
      user = await handleSignInWithEmailLink(currentHref);
      // TODO: is it new user for real?
      user.newbie = true;
    }
  }

  if (!user) {
    throw new Error("unverified");
  }

  return user;
};
