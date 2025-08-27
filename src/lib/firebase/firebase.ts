// firebase.ts

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  });
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();
let popupInProgress = false;

export async function signInWithGoogle() {
  if (popupInProgress) return; // prevent multiple popups
  popupInProgress = true;
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      console.warn("User closed the login popup.");
    } else if (error.code === "auth/cancelled-popup-request") {
      console.warn("Cancelled because another popup was already open.");
    } else {
      console.error("Login error:", error);
    }
  } finally {
    popupInProgress = false;
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
