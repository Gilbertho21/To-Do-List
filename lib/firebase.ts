import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
};

// Supaya tidak error "Firebase App already initialized"
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);