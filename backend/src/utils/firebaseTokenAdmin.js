const admin = require("firebase-admin");
const serviceAccount = require("../../config/firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function gerarTokenFirebase(uid) {
  const token = await admin.auth().createCustomToken(uid, { admin: true });
  return token;
}

module.exports = gerarTokenFirebase;
