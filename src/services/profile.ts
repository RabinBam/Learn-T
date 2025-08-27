// Firestore-backed user profile helpers.

import { db, storage } from "@/lib/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export type UserProfile = {
  name: string;
  // Stage progression in-game (level 1, 2, 3... actual stages)
  currentLevel: number;
  // XP-based progression level (based on XP scaling)
  profileLevel: number;
  xp: number;
  nextLevelXp: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  avatar: string; // ✅ always string ("" if not set)
  bio: string;
  updatedAt?: any;
};

const DEFAULT_PROFILE: UserProfile = {
  name: "PlayerOne",
  currentLevel: 1, // start at stage 1
  profileLevel: 1, // start at XP level 1
  xp: 0,
  nextLevelXp: 5000,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  avatar: "", // ✅ use "" instead of null
  bio: "",
};

export async function getOrCreateProfile(uid: string): Promise<UserProfile> {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    const newProfile = { ...DEFAULT_PROFILE, updatedAt: serverTimestamp() };
    await setDoc(refDoc, newProfile);
    return newProfile;
  }
  return snap.data() as UserProfile;
}

export async function updateProfileField(
  uid: string,
  field: keyof UserProfile,
  value: UserProfile[typeof field]
) {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, { ...DEFAULT_PROFILE, [field]: value, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(refDoc, { [field]: value, updatedAt: serverTimestamp() });
  }
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
  try {
    await deleteObject(r);
  } catch {}
  await updateProfileField(uid, "avatar", ""); // ✅ empty string
}

// ------------------------------------------------------
// 🔥 Update XP & XP-based Level progression in Firestore
// ------------------------------------------------------
export async function addXpAndUpdateLevel(uid: string, gainedXp: number) {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);

  let data: UserProfile;
  if (!snap.exists()) {
    const newProfile = { ...DEFAULT_PROFILE, updatedAt: serverTimestamp() };
    await setDoc(refDoc, newProfile);
    data = newProfile;
  } else {
    data = snap.data() as UserProfile;
  }

  let { xp = 0, profileLevel = 1, nextLevelXp = 5000 } = data;
  xp += gainedXp;

  // Level up loop (XP-based level, not stage)
  while (xp >= nextLevelXp) {
    xp -= nextLevelXp;
    profileLevel += 1;
    nextLevelXp = Math.floor(nextLevelXp * 1.5); // progression scaling
  }

  await updateDoc(refDoc, {
    xp,
    profileLevel,
    nextLevelXp,
    updatedAt: serverTimestamp(),
  });

  return { xp, level: profileLevel, nextLevelXp };
}

// 🔥 New helper: update stage progression (currentLevel)
export async function advanceStage(uid: string, newStage: number) {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, { ...DEFAULT_PROFILE, currentLevel: newStage, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(refDoc, {
      currentLevel: newStage,
      updatedAt: serverTimestamp(),
    });
  }
}

// New helper: record games played / wins / losses atomically
export async function recordGameResult(uid: string, success: boolean) {
  const refDoc = doc(db, "users", uid);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) {
    const base = {
      ...DEFAULT_PROFILE,
      gamesPlayed: 1,
      wins: success ? 1 : 0,
      losses: success ? 0 : 1,
      updatedAt: serverTimestamp(),
    };
    await setDoc(refDoc, base);
    return;
  }

  await updateDoc(refDoc, {
    gamesPlayed: increment(1),
    wins: success ? increment(1) : increment(0),
    losses: success ? increment(0) : increment(1),
    updatedAt: serverTimestamp(),
  });
}
