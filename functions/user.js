import functions from "firebase-functions";

/**
 * (By email) verified users can create a game
 */

export const userAuthenticated = functions
  .region("europe-west1")
  .auth.user()
  .onCreate((user, context) => {
    console.log("userAuthenticated", user, context);
  });