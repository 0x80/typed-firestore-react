import type {
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import { useDocument_fork, useDocumentOnce_fork } from "./fork/firestore";
import { makeMutableDocument } from "./make-mutable-document";
import type { FsDocument, UnknownObject } from "./types.js";

export function useDocument<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [FsDocument<T>, false] | [undefined, true] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useDocument_fork(ref);

  if (error) {
    throw error;
  }

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false] : [undefined, true];
}

/** A version of useDocument that doesn't throw when the document doesn't exist. */
export function useDocumentMaybe<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [FsDocument<T> | undefined, boolean] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  const [snapshot, isLoading] = useDocument_fork(ref);

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return [document, isLoading];
}

export function useDocumentData<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [T, false] | [undefined, true] {
  const [document, isLoading] = useDocument(collectionRef, documentId);

  return isLoading ? [undefined, true] : [document.data, false];
}

export function useDocumentOnce<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [FsDocument<T>, false] | [undefined, true] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useDocumentOnce_fork(ref);

  if (error) {
    throw error;
  }

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false] : [undefined, true];
}

export function useDocumentDataOnce<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [T, false] | [undefined, true] {
  const [document, isLoading] = useDocumentOnce(collectionRef, documentId);

  return isLoading ? [undefined, true] : [document.data, false];
}

export function useSpecificDocument<T extends UnknownObject>(
  documentRef: DocumentReference<T>
): [FsDocument<T>, false] | [undefined, true] {
  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useDocument_fork(documentRef);

  if (error) {
    throw error;
  }

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false] : [undefined, true];
}

export function useSpecificDocumentData<T extends UnknownObject>(
  documentRef: DocumentReference<T>
): [T, false] | [undefined, true] {
  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useDocument_fork(documentRef);

  if (error) {
    throw error;
  }

  const data = useMemo(
    () => (snapshot?.exists() ? snapshot.data() : undefined),
    [snapshot]
  );

  return data ? [data, false] : [undefined, true];
}
