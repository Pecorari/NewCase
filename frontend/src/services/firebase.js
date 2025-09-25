import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBYh9zJbsrgPeqDBQ-cydu4Bg2h0RhpDns",
  authDomain: "newcase-a6d58.firebaseapp.com",
  projectId: "newcase-a6d58",
  storageBucket: "newcase-a6d58.firebasestorage.app",
  messagingSenderId: "189534612683",
  appId: "1:189534612683:web:aebd1e5169f96a7c2dff4e"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

export { auth, storage };
