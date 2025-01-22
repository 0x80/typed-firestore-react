import type { DocumentSnapshot } from "firebase/firestore";
import type { FsDocument, UnknownObject } from "~/types";

export function makeDocument<T extends UnknownObject>(
  doc: DocumentSnapshot<T>
): FsDocument<T> {
  return {
    id: doc.id,
    data: doc.data()!,
  };
}
