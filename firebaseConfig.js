import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // ✅ storage import

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWPmJT6QwDzSKrA86YJhhh2hwVAMgCb-I",
  authDomain: "doctor-f3115.firebaseapp.com",
  databaseURL: "https://doctor-f3115-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doctor-f3115",
  storageBucket: "doctor-f3115.appspot.com",   // ✅ ekhane ".app" noy, ".appspot.com" dite hobe
  messagingSenderId: "1020363900244",
  appId: "1:1020363900244:web:fd9dc6079e5dff245a34c1",
  measurementId: "G-VYT366SKZ7"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app);
const db = getDatabase(app, "https://doctor-f3115-default-rtdb.asia-southeast1.firebasedatabase.app");
const storage = getStorage(app);   // ✅ storage initialize

export { auth, db, storage };
