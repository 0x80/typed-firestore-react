import {
  updateDoc,
  type DocumentSnapshot,
  type Transaction,
  type UpdateData,
} from "firebase/firestore";

import type {
  FsMutableDocument,
  FsMutableDocumentFromTransaction,
} from "~/types";

export function makeMutableDocument<T extends Record<string, unknown>>(
  doc: DocumentSnapshot<T>
): FsMutableDocument<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => updateDoc(doc.ref, data),
  };
}

export function makeMutableDocumentFromTransaction<
  T extends Record<string, unknown>,
>(
  doc: DocumentSnapshot<T>,
  transaction: Transaction
): FsMutableDocumentFromTransaction<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => transaction.update(doc.ref, data),
  };
}
