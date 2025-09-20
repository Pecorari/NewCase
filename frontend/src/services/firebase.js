import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJ2pYN0Tan8u6IkyEBUsujcUmYNC08OOQ",
  authDomain: "mycellstore-da6f9.firebaseapp.com",
  projectId: "mycellstore-da6f9",
  storageBucket: "mycellstore-da6f9.firebasestorage.app",
  messagingSenderId: "700054947412",
  appId: "1:700054947412:web:666a6e81007e99eaeb0fc1"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

export { auth, storage };
