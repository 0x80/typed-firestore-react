import type {
  DocumentReference,
  Transaction,
  UpdateData,
} from "firebase/firestore";

/**
 * A simple serialize-able document type. Use this when defining functions that
 * take a document but do not need to mutate it.
 */
export type FsDocument<T> = Readonly<{
  id: string;
  data: T;
}>;

export type FsMutableDocument<T> = Readonly<{
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Promise<void>;
}> &
  FsDocument<T>;

export type FsMutableDocumentFromTransaction<T> = Readonly<{
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Transaction;
}> &
  FsDocument<T>;
