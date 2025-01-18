import type { CollectionReference } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import {
  useDocument as useDocument_orig,
  useDocumentOnce as useDocumentOnce_orig,
} from "react-firebase-hooks/firestore";
import { makeMutableDocument } from "./helpers";
import type { FsDocument } from "./types.js";

export function useDocument<T extends Record<string, unknown>>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [FsDocument<T> | undefined, boolean] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  const [snapshot, isLoading, error] = useDocument_orig(ref);

  if (error) {
    throw error;
  }

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return [document, isLoading];
}

/** A version of useDocument that doesn't throw when the document doesn't exist. */
export function useDocumentMaybe<T extends Record<string, unknown>>(
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

export function useDocumentData<T extends Record<string, unknown>>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [T | undefined, boolean] {
  const [document, isLoading] = useDocument(collectionRef, documentId);

  return [document?.data, isLoading];
}

export function useDocumentOnce<T extends Record<string, unknown>>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [FsDocument<T> | undefined, boolean] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  const [snapshot, isLoading, error] = useDocumentOnce_orig(ref);

  if (error) {
    throw error;
  }

  const document = useMemo(
    () => (snapshot?.exists() ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return [document, isLoading];
}
