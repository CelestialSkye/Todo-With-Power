import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export const useFirestore = (collectionName) => {
  const { db, userId, isAuthReady } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthReady || !userId || !db) {
      setIsLoading(false);
      return;
    }

    const colRef = collection(db, `users/${userId}/${collectionName}`);
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const formattedData = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setData(formattedData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore subscription failed:", err);
        setError(`Failed to load data: ${err.message}`);
        setIsLoading(false);
        setData([]);
      }
    );

    return () => unsubscribe();
  }, [db, userId, isAuthReady, collectionName]);

  const addDocument = async (docData) => {
    if (!db || !userId) {
      setError("Database not initialized");
      return null;
    }
    try {
      const colRef = collection(db, `users/${userId}/${collectionName}`);
      const newDoc = await addDoc(colRef, {
        ...docData,
        createdAt: new Date().toISOString(),
      });
      return newDoc.id;
    } catch (err) {
      setError(err.message);
      console.error("Error adding document:", err);
    }
  };

  const updateDocument = async (id, updates) => {
    if (!db || !userId) {
      setError("Database not initialized");
      return;
    }
    try {
      const docRef = doc(db, `users/${userId}/${collectionName}`, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
      console.error("Error updating document:", err);
    }
  };

  const deleteDocument = async (id) => {
    if (!db || !userId) {
      setError("Database not initialized");
      return;
    }
    try {
      const docRef = doc(db, `users/${userId}/${collectionName}`, id);
      await deleteDoc(docRef);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting document:", err);
    }
  };

  return {
    data,
    isLoading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  };
};
