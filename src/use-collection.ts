import {
  type CollectionReference,
  type QueryConstraint,
  limit,
  query,
} from "firebase/firestore";
import { useMemo } from "react";
import {
  useCollectionOnce as useCollectionOnce_orig,
  useCollection as useCollection_orig,
} from "react-firebase-hooks/firestore";
import { makeMutableDocument } from "./make-mutable-document";
import type { FsDocument, UnknownObject } from "./types";
import { isDefined } from "./utils";

export function useCollection<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: (QueryConstraint | undefined)[]
): [FsDocument<T>[], false] | [undefined, true] {
  const hasNoConstraints = queryConstraints.length === 0;

  const _query = hasNoConstraints
    ? query(collectionRef, limit(500))
    : query(collectionRef, ...queryConstraints.filter(isDefined));

  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useCollection_orig(_query);

  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}. Error code: ${error.code}`
    );
  }

  const docs = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }
    return snapshot.docs.map((doc) => makeMutableDocument(doc));
  }, [snapshot]);

  return docs ? [docs, false] : [undefined, true];
}

export function useCollectionOnce<T extends UnknownObject>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: (QueryConstraint | undefined)[]
): [FsDocument<T>[], false] | [undefined, true] {
  const hasNoConstraints = queryConstraints.length === 0;

  const _query = hasNoConstraints
    ? query(collectionRef, limit(500))
    : query(collectionRef, ...queryConstraints.filter(isDefined));

  /**
   * We do not need the loading state really. If there is not data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useCollectionOnce_orig(_query);

  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}. Error code: ${error.code}`
    );
  }

  const docs = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }
    return snapshot.docs.map((doc) => makeMutableDocument(doc));
  }, [snapshot]);

  return docs ? [docs, false] : [undefined, true];
}
