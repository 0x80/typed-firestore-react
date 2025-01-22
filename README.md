# Typed Firestore - React

Elegant, strongly-typed React hooks for handling Firestore documents. This is
currently implemented as a stronger-typed, more focussed and opinionated
abstraction on top of [react-firebase-hooks]().

This library uses typing similar to
[@typed-firestore/server](https://github.com/0x80/typed-firestore-server), so
you can be consistent between server and client code.

## Features

- Type your collections once, and infer from that.
- Uses the same [FsDocument](#fsdocument) abstraction as found in
  [typed-firestore-server](https://github.com/0x80/typed-firestore-server) for
  consistency between front and backend code.
- Throws errors instead of returning them. See
  [throwing errors](#throwing-errors) for motivation.

## Installation

`pnpm add @typed-firestore/react`

## Usage

Create a file in which you define refs for all of your database collections, and
map each to the appropriate type, as shown below.

```ts
// db-refs.ts
import { CollectionReference } from "firebase/firestore";
import { db } from "./firestore";
import { User, WishlistItem, Book } from "./types";

export const refs = {
  /** For top-level collections it's easy */
  users: db.collection("users") as CollectionReference<User>,
  books: db.collection("books") as CollectionReference<Book>,
  /** For sub-collections you could use a function that returns the reference. */
  userWishlist: (userId: string) =>
    db
      .collection("users")
      .doc(userId)
      .collection("wishlist") as CollectionReference<WishlistItem>,

  /** This object never needs to change */
} as const;
```

Then in a component you would do something like this:

```ts
import { useDocument } from "@typed-firestore/react";
import { UpdateData } from "firebase/firestore";

export function DisplayName({userId}: {userId: string}) {

/** The returned user is typed as FsMutableDocument<User> */
const [user, isLoading] = useDocument(refs.users, userId);

function handleUpdate() {
  /**
   * Here you can only pass in properties that exist on the User type.
   * FieldValue is allowed to be used to set things like Timestamps.
   */
  user.update({modifiedAt: FieldValue.serverTimestamp()})
}

if (isLoading) {
  return <LoadingIndicator/>;
  }

  return <div onClick={handleUpdate}>{user.data.displayName}</div>;
}
```

Notice how we did not need to import the User type, or manually type our update
data to satisfy the type constraints. Everything flows from the collection refs.
Re-using collection refs also avoids having to remember the names and write them
correctly.

## API

### Hooks

| Hook                  | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `useDocument`         | Use a document and subscribe to changes                                    |
| `useDocumentData`     | Use only the data part of a document and subscribe to changes              |
| `useDocumentMaybe`    | Use a document that might not exist                                        |
| `useDocumentOnce`     | Use a document once and do not subscribe for changes                       |
| `useDocumentDataOnce` | Use only the data part of a document once and do not subscribe for changes |
| `useCollection`       | Query a collection and subscribe for changes                               |
| `useCollectionOnce`   | Query a collection once and do not subscribe for changes                   |

### Functions

Besides hooks, this library also provides a set of functions that can be used
outside of a component. For example when you want to fetch data with ReactQuery.

```ts
const { data, isError } = useQuery({
  queryKey: [collectionRef.path, documentId],
  queryFn: () => getDocument(collectionRef, documentId),
});
```

| Function                           | Description                                                    |
| ---------------------------------- | -------------------------------------------------------------- |
| `getDocument`                      | Fetch a document                                               |
| `getDocumentData`                  | Fetch only the data part of a document                         |
| `getDocumentMaybe`                 | Fetch a document that might not exist                          |
| `getDocumentInTransaction`         | Fetch a document as part of a transaction                      |
| `getDocumentInTransactionMaybe`    | Fetch a document that might not exist as part of a transaction |
| `getSpecificDocument`              | Fetch a specific document                                      |
| `getSpecificDocumentData`          | Fetch only the data part of a specific document                |
| `getSpecificDocumentInTransaction` | Fetch a specific document as part of a transaction             |

## Working with Documents

I prefer to perform all document mutations server-side via an API call,
especially if older versions of your app could be around for a while like with
react-native, because a bug in client-side code could have lasting effects on
the consistency of your data.

Facilitating client-side writes in a safe way also requires you to write
database rules for your Firestore documents, which can get very complex, so
mutating documents server-side is not only easier to to reason about but also
secure by default.

The default immutable document type is `FsDocument<T>`. Use this type when you
write functions that take data without needing to change it.

```ts
export type FsDocument<T> = {
  id: string;
  data: T;
};
```

The hooks return mutable documents, but thanks to TS structural typing, you can
simply pass them along as if they were immutable `FsDocument` types.

Each document conveniently contains a typed `update` function, which only allows
you to pass in properties that exist on the type. Firestore FieldValue is
allowed to be used to set things like Timestamps.

With some more complex nested data, it can happend that the Firestore
`UpdateData<T>` type doesn't accept your perfectly ok data. In that case, if you
do not need to use `FieldValue` you can use the `updatePartial` method as a
workaround.

The original document `ref` is also available, in case you need functionality
that is not covered by this library, or you need to call `update` untyped.

```ts
export type FsMutableDocument<T> = {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Promise<void>;
  updatePartial: (data: Partial<T>) => Promise<void>;
  delete: () => Promise<void>;
};
```

In the case of a transaction, the `

```ts
export type FsMutableDocumentInTransaction<T> = {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Transaction;
  updatePartial: (data: Partial<T>) => Transaction;
  delete: () => Transaction;
};
```

## Throwing Errors

The hooks in this library throw errors, which is not a common practice, but this
was a deliberate choice.

In my experience, runtime exceptions for Firestore documents and collection
queries are very rare. By throwing we can avoid having to handle errors or even
loading state separately in every calling context, and optimize for the
happy-path.

The most common errors are:

1. An index is required but has not been created yet.
2. The document does not exist.
3. You do not have permission to read the document.

I think all of these are likely to be caught during development and testing and
should not occur in production code.

In some cases it is a valid state that the document might not exist, so for
those situations we have the `*Maybe` variants like `useDocumentMaybe()`. These
functions do not throw but simply return undefined if the document does not
exist.

This approach of not handling errors in the calling context, also has a nice
benefit, because now the loading state is directly tied to the data
availability. If you wait for the loading state from `useDocument()` to be true,
the Typescript compiler is also guaranteed that the data is defined.

In that sense, you do not need the loading state at all.It would be sufficient
to just wait for the data to become defined, but for readability I would still
recommend using the loading state variable.
