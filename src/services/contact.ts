import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveContactMessage({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const ref = collection(db, "contactMessages");
  await addDoc(ref, {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
}
