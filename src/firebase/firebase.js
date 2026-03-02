import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase project configuration (yes this is public i dont care since it's a school project and im too lazy to hide it i have backed up the database so even if someone deletes it i can just restore it)
export const firebaseConfig = {
  apiKey: "AIzaSyB6weNm1c_LG7iU0uhKGLluznOv5voVL5Y",
  authDomain: "bdms-software-engineering.firebaseapp.com",
  databaseURL: "https://bdms-software-engineering-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bdms-software-engineering",
  storageBucket: "bdms-software-engineering.firebasestorage.app",
  messagingSenderId: "776528961974",
  appId: "1:776528961974:web:78f5e27f6d96c415d32117",
  measurementId: "G-0EN5BQENDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth – used for Login / Signup / Logout
export const auth = getAuth(app);

// Realtime Database – used to store user profiles & app data
export const db = getDatabase(app);

export default app;