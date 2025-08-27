// src/services/achievements.ts
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  rarity: string;
  xpReward: number;
  maxProgress?: number;
  progress?: number;
  unlocked?: boolean;
};

export async function fetchAchievements(uid: string): Promise<Achievement[]> {
  try {
    const col = collection(db, "users", uid, "achievements");
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Achievement[];
  } catch {
    return [];
  }
}
