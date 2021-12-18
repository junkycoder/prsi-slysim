import functions from "firebase-functions";

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

export const userCreatesGame = functions
  .region(config.firebase.region)
  .firestore.document("users/{userId}/games/{gameId}")
  .onCreated((snapshot, context) => {
    console.log("userCreatesGame", snapshot, context);
  });