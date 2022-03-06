/**
 * Prší backend functions
 */

import admin from "firebase-admin";

admin.initializeApp();

export {
  // callable
  create as createGame,
  join as joinGame,
  move as gameMove,
  // triggers
  copyPlayerGame,
  makeCpuMove,
} from "./game.js";
export { userAuthenticated } from "./user.js";
