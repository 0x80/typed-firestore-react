import {
  deleteDoc,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type Transaction,
  type UpdateData,
} from "firebase/firestore";
import type { FsMutableDocument, FsMutableDocumentInTransaction } from "~/types";

export function makeMutableDocument<T extends DocumentData>(
  doc: DocumentSnapshot<T>,
): FsMutableDocument<T> {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document ${doc.ref.path} exists but has no data`);
  }
  return {
    id: doc.id,
    data,
    ref: doc.ref,
    update: (data: UpdateData<T>) => updateDoc(doc.ref, data),
    updateWithPartial: (data: Partial<T>) => updateDoc(doc.ref, data as UpdateData<T>),
    delete: () => deleteDoc(doc.ref),
  };
}

export function makeMutableDocumentInTransaction<T extends DocumentData>(
  doc: DocumentSnapshot<T>,
  tx: Transaction,
): FsMutableDocumentInTransaction<T> {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document ${doc.ref.path} exists but has no data`);
  }
  return {
    id: doc.id,
    data,
    ref: doc.ref,
    update: (data: UpdateData<T>) => tx.update(doc.ref, data),
    updateWithPartial: (data: Partial<T>) => tx.update(doc.ref, data as UpdateData<T>),
    delete: () => tx.delete(doc.ref),
  };
}
