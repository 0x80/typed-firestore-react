import {
  type CollectionReference,
  type QueryConstraint,
  limit,
  query,
} from "firebase/firestore";
import { useMemo } from "react";
import { useCollection as useCollection_orig } from "react-firebase-hooks/firestore";
import { makeMutableDocument } from "./helpers";
import type { FsDocument } from "./types";
import { isDefined } from "./utils";

export function useCollection<T extends Record<string, unknown>>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: (QueryConstraint | undefined)[]
): [FsDocument<T>[] | undefined, boolean] {
  const hasNoConstraints = queryConstraints.length === 0;

  const _query = hasNoConstraints
    ? query(collectionRef, limit(500))
    : query(collectionRef, ...queryConstraints.filter(isDefined));

  const [snapshot, isLoading, error] = useCollection_orig(_query);

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

  return [docs, isLoading];
}
