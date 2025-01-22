import {
  deleteDoc,
  updateDoc,
  type DocumentSnapshot,
  type Transaction,
  type UpdateData,
} from "firebase/firestore";
import type {
  FsMutableDocument,
  FsMutableDocumentInTransaction,
  UnknownObject,
} from "~/types";

export function makeMutableDocument<T extends UnknownObject>(
  doc: DocumentSnapshot<T>
): FsMutableDocument<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => updateDoc(doc.ref, data),
    updateWithPartial: (data: Partial<T>) =>
      updateDoc(doc.ref, data as UpdateData<T>),
    delete: () => deleteDoc(doc.ref),
  };
}

export function makeMutableDocumentInTransaction<T extends UnknownObject>(
  doc: DocumentSnapshot<T>,
  tx: Transaction
): FsMutableDocumentInTransaction<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => tx.update(doc.ref, data),
    updateWithPartial: (data: Partial<T>) =>
      tx.update(doc.ref, data as UpdateData<T>),
    delete: () => tx.delete(doc.ref),
  };
}
