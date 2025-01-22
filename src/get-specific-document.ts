import {
  doc,
  getDoc,
  type CollectionReference,
  type Transaction,
} from "firebase/firestore";
import { invariant } from "~/utils";
import { makeDocument, makeMutableDocument } from "./helpers";
import type { UnknownObject } from "./types";

export async function getSpecificDocument<T extends UnknownObject>(
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

export async function getSpecificDocumentData<T extends UnknownObject>(
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

export async function getSpecificDocumentFromTransaction<
  T extends UnknownObject,
>(
  transaction: Transaction,
  collectionRef: CollectionReference<T>,
  documentId: string
) {
  const snapshot = await transaction.get(doc(collectionRef, documentId));

  invariant(
    snapshot.exists(),
    `No document available at ${collectionRef.path}/${documentId}`
  );

  return makeDocument(snapshot);
}
