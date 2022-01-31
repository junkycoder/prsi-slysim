/**
 * Prší backend functions
 */

import admin from "firebase-admin";

admin.initializeApp();

export {
  create as createGame,
  copyPlayerGame,
  join as joinGame,
} from "./game.js";
export { userAuthenticated } from "./user.js";
