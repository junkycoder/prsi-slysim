import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import minimist from "minimist";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./service-account.json";

initializeApp({
  credential: applicationDefault(),
  projectId: "prsi-slysim",
});

const db = getFirestore();

const args = minimist(process.argv.slice(2), {
  string: ["doc"],
  boolean: ["users"],
  // default: { emulation: false },
});

if (args.doc) {
  const doc = await db.doc(args.doc).get();
  console.log(JSON.stringify(doc.data(), null, 2));
}

if (args.users) {
  listAllUsers();
}

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  getAuth()
    .listUsers(1000, nextPageToken)
    .then((listUsersResult) => {
      listUsersResult.users.forEach((userRecord) => {
        const {email} = userRecord.toJSON();
        console.log(email)
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
    })
    .catch((error) => {
      console.log("Error listing users:", error);
    });
}
