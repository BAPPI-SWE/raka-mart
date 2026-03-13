import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvvvngGfheeCp53zcsdnLTxM5_HmxB5w4",
  authDomain: "raka-mart.firebaseapp.com",
  projectId: "raka-mart",
  storageBucket: "raka-mart.firebasestorage.app",
  messagingSenderId: "365861171540",
  appId: "1:365861171540:web:8885992c9ff383676f18c1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
