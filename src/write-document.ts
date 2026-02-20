import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
} from "firebase/firestore";

export function setDocument<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId: string,
  data: WithFieldValue<T>,
  options?: SetOptions,
): Promise<void> {
  return setDoc(doc(collectionRef, documentId), data, options ?? {});
}

export function setSpecificDocument<T extends DocumentData>(
  documentRef: DocumentReference<T>,
  data: WithFieldValue<T>,
  options?: SetOptions,
): Promise<void> {
  return setDoc(documentRef, data, options ?? {});
}

export function updateDocument<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId: string,
  data: UpdateData<T>,
): Promise<void> {
  return updateDoc(doc(collectionRef, documentId), data);
}

export function updateSpecificDocument<T extends DocumentData>(
  documentRef: DocumentReference<T>,
  data: UpdateData<T>,
): Promise<void> {
  return updateDoc(documentRef, data);
}

export function deleteDocument<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId: string,
): Promise<void> {
  return deleteDoc(doc(collectionRef, documentId));
}

export function deleteSpecificDocument<T extends DocumentData>(
  documentRef: DocumentReference<T>,
): Promise<void> {
  return deleteDoc(documentRef);
}
