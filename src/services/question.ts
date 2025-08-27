// src/services/questions.ts
import { db } from "@/lib/firebase/firebase"; // Firestore instance
import { collection, getDocs } from "firebase/firestore";

// 👇 Match your game engine LevelType
export type LevelType = "utilities" | "palette" | "challenge";

// 👇 Define Firestore Question type consistent with LevelDef
export type Question = {
  id: number;                 // numeric ID for game engine
  type: LevelType;            // ✅ restricts to valid LevelTypes
  required: string[];         // CSS/utility classes required
  palette: string[];          // Available palette of classes
  timeLimit: number;          // Time in seconds
  difficulty: number;         // Difficulty rating
  mode: string;               // e.g., "single", "timed"
  description: string;        // Question description
  targetElement: string;      // CSS selector or element
  challengeText?: string;     // Optional extra info
};

// 👇 Fetch all questions from Firestore
export async function fetchQuestions(): Promise<Question[]> {
  try {
    const colRef = collection(db, "questions");
    const snapshot = await getDocs(colRef);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data() as Omit<Question, "id" | "type"> & { type: string };

      return {
        id: index, // use index for now, or doc.id if string IDs are okay
        ...data,
        // ✅ ensure type is treated as LevelType
        type: data.type as LevelType,
      };
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}
