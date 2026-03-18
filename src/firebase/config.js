// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkR0Q2_tGFKxWaJ2ufR3mUzztauuALFU8",
  authDomain: "profile-4def3.firebaseapp.com",
  projectId: "profile-4def3",
  storageBucket: "profile-4def3.firebasestorage.app",
  messagingSenderId: "54903359089",
  appId: "1:54903359089:web:cbb500f77c3dbc4511fdd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
