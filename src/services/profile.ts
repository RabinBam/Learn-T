// Firestore-backed user profile helpers.

import { db, storage } from "@/lib/firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export type UserProfile = {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  avatar: string | null;
  bio: string;
  updatedAt?: any;
};

const DEFAULT_PROFILE: UserProfile = {
  name: "PlayerOne",
  level: 1,
  xp: 0,
  nextLevelXp: 5000,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  avatar: null,
  bio: "",
};

export async function getOrCreateProfile(uid: string): Promise<UserProfile> {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, { ...DEFAULT_PROFILE, updatedAt: serverTimestamp() });
    return DEFAULT_PROFILE;
  }
  return snap.data() as UserProfile;
}

export async function updateProfileField(uid: string, field: keyof UserProfile, value: UserProfile[typeof field]) {
  const refDoc = doc(db, "users", uid);
  await updateDoc(refDoc, { [field]: value, updatedAt: serverTimestamp() });
}

export async function uploadAvatar(uid: string, file: File) {
  const r = ref(storage, `avatars/${uid}`);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  await updateProfileField(uid, "avatar", url);
  return url;
}

export async function removeAvatar(uid: string) {
  const r = ref(storage, `avatars/${uid}`);
  try { await deleteObject(r); } catch {}
  await updateProfileField(uid, "avatar", null);
}
