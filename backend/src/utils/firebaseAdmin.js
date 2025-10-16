const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const serviceAccount = require("../../config/firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });
}


async function gerarTokenFirebase(uid) {
  const token = await admin.auth().createCustomToken(uid, { admin: true });
  return token;
}


const bucket = admin.storage().bucket();

async function uploadEtiquetaPDF(buffer, fileName) {
  try {
    const file = bucket.file(`etiquetas/${fileName}`);
    const token = uuidv4();

    await file.save(buffer, {
      contentType: "application/pdf",
      metadata: {
        metadata: { firebaseStorageDownloadTokens: token }
      },
      resumable: false,
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`etiquetas/${fileName}`)}?alt=media&token=${token}`;

    return publicUrl;
  } catch (error) {
    console.error("Erro ao enviar PDF para o Firebase:", error);
    throw new Error("Falha ao enviar etiqueta para o armazenamento.");
  }
}

module.exports = {
  gerarTokenFirebase,
  uploadEtiquetaPDF
};
