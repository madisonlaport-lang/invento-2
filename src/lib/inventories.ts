import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export async function createInventory(userId: string, data: any) {
  const docRef = await addDoc(collection(db, "inventories"), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getUserInventories(userId: string) {
  const q = query(
    collection(db, "inventories"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateInventory(inventoryId: string, data: any) {
  const ref = doc(db, "inventories", inventoryId);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInventory(inventoryId: string) {
  const ref = doc(db, "inventories", inventoryId);
  await deleteDoc(ref);
}
