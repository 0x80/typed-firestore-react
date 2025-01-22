import type { CollectionReference } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import {
  useDocument as useDocument_orig,
  useDocumentOnce as useDocumentOnce_orig,
} from "react-firebase-hooks/firestore";
import { makeMutableDocument } from "./helpers";
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
  const [snapshot, , error] = useDocument_orig(ref);

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
  const [snapshot, isLoading] = useDocument_orig(ref);

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
  const [snapshot, , error] = useDocumentOnce_orig(ref);

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
