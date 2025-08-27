// src/services/questions.ts
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export type Question = {
  id: number;
  type: string;
  required: string[];
  palette: string[];
  timeLimit: number;
  difficulty: number;
  mode: string;
  description: string;
  targetElement: string;
  challengeText?: string;
};

export async function fetchQuestions(): Promise<Question[]> {
  try {
    const col = collection(db, "questions");
    const snap = await getDocs(col);
    return snap.docs.map((doc) => doc.data() as Question);
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
}
