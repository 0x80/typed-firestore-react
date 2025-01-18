import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { FsDocument } from "~/types";

export function makeFsDocument<T>(
  doc: DocumentSnapshot<DocumentData>
): FsDocument<T> {
  return {
    id: doc.id,
    data: doc.data() as T,
  };
}
