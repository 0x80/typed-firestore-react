import {
  doc,
  getDoc,
  type CollectionReference,
  type Transaction,
} from "firebase/firestore";
import { invariant } from "~/utils";
import { makeMutableDocument } from "./make-mutable-document";
import type { UnknownObject } from "./types";

export async function getDocument<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await getDoc(doc(collectionRef, documentId));

  invariant(
    snapshot.exists(),
    `No document available at ${collectionRef.path}/${documentId}`
  );

  return makeMutableDocument(snapshot);
}

export async function getDocumentMaybe<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await getDoc(doc(collectionRef, documentId));

  if (!snapshot.exists()) return;

  return makeMutableDocument(snapshot);
}

export async function getDocumentData<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const docSnap = await getDoc(doc(collectionRef, documentId));

  invariant(
    docSnap.exists(),
    `No document available at ${collectionRef.path}/${documentId}`
  );

  return docSnap.data();
}

export async function getDocumentDataMaybe<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await getDoc(doc(collectionRef, documentId));

  if (!snapshot.exists()) return;

  return snapshot.data();
}

export async function getDocumentInTransaction<T extends UnknownObject>(
  transaction: Transaction,
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await transaction.get(doc(collectionRef, documentId));

  invariant(
    snapshot.exists(),
    `No document available at ${collectionRef.path}/${documentId}`
  );

  return makeMutableDocument(snapshot);
}

export async function getDocumentInTransactionMaybe<T extends UnknownObject>(
  transaction: Transaction,
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await transaction.get(doc(collectionRef, documentId));

  if (!snapshot.exists()) {
    return;
  }

  return makeMutableDocument(snapshot);
}
