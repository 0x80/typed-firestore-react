import {
  getDoc,
  type DocumentReference,
  type Transaction,
} from "firebase/firestore";
import { invariant } from "~/utils";
import { makeDocument, makeMutableDocument } from "./helpers";
import type { UnknownObject } from "./types";

export async function getSpecificDocument<T extends UnknownObject>(
  documentRef: DocumentReference<T>
) {
  const snapshot = await getDoc(documentRef);

  invariant(snapshot.exists(), `No document available at ${documentRef.path}`);

  return makeMutableDocument(snapshot);
}

export async function getSpecificDocumentData<T extends UnknownObject>(
  documentRef: DocumentReference<T>
) {
  const docSnap = await getDoc(documentRef);

  invariant(docSnap.exists(), `No document available at ${documentRef.path}`);

  return docSnap.data();
}

export async function getSpecificDocumentFromTransaction<
  T extends UnknownObject,
>(transaction: Transaction, documentRef: DocumentReference<T>) {
  const snapshot = await transaction.get(documentRef);

  invariant(snapshot.exists(), `No document available at ${documentRef.path}`);

  return makeDocument(snapshot);
}
