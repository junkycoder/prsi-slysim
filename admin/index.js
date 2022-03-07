import admin from "firebase-admin";
import { createRequire } from "module";
import minimist from "minimist";

const require = createRequire(import.meta.url);
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const args = minimist(process.argv.slice(2), {
  string: ["doc"],
  // boolean: [""],
  // default: { emulation: false },
});

if (args.doc) {
  const data = (await db.doc(args.doc).get()).data();
  console.log(JSON.stringify(data, null, 2));
}
