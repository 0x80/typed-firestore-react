# Typed Firestore - React

Elegant, typed abstractions for handling Firestore documents in React
applications.

This library is based on the same concepts as
[@typed-firestore/server](https://github.com/0x80/typed-firestore-server),
allowing your project to be consistent in both server and client code.

## Features

- Avoid having to import and apply types everywhere, by typing your collections
  once.
- Use the same convenient [document abstraction](#fsdocument) abstraction as
  found in
  [typed-firestore-server](https://github.com/0x80/typed-firestore-server).
- Simplify handling and loading states by throwing errors instead of returning
  them. See [throwing errors](#throwing-errors) for motivation.

## Installation

`pnpm add @typed-firestore/react`

## Usage

Create a file in which you define refs for all of your database collections, and
map each to the appropriate type, as shown below.

```ts
// db-refs.ts
import { collection, type CollectionReference } from "firebase/firestore";
import { db } from "./firestore";
import { User, WishlistItem, Book } from "./types";

export const refs = {
  /** For top-level collections it's easy */
  users: collection(db, "users") as CollectionReference<User>,
  books: collection(db, "books") as CollectionReference<Book>,
  /** For sub-collections you could use a function that returns the reference. */
  userWishlist: (userId: string) =>
    collection(
      db,
      `users/${userId}/wishlist`
    ) as CollectionReference<WishlistItem>,

  /** This object never needs to change */
} as const;
```

Below is an example of how to use the hooks in a component:

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

  /**
   * Here Typescript understands that user.data is available, and it is typed
   * correctly to User.
   */
  return <div onClick={handleUpdate}>{user.data.displayName}</div>;
}
```

Notice how we did not need to import the User type, or manually type our update
data to satisfy the type constraints. Everything flows from the collection refs.
Re-using collection refs also avoids having to remember the names and write them
correctly.

Also, because errors are being thrown instead of returned, the Typescript
compiler is assured that if `isLoading` becomes false, the `user.data` property
should be available (because otherwise an error would have been thrown).

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
`UpdateData<T>` type doesn't accept your data. For those situations
`updateWithPartial` is available as an alternative.

The original document `ref` is also available, in case you need functionality
that is not covered by this library, or you need to call `update` untyped.

```ts
export type FsMutableDocument<T> = {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Promise<void>;
  updatePartial: (data: PartialWithFieldValue<T>) => Promise<void>;
  delete: () => Promise<void>;
};
```

See the
[@typed-firestore/server docs](https://github.com/0x80/typed-firestore-server#document-types)
for more info.

## Client-Side Mutations

In my projects I prefer to have all mutations happen on the server-side via an
API call, so you might want to consider that, especially if older versions of
your app could be around for a while like with mobile apps, because a bug in
client-side code could have lasting effects on the consistency of your data, and
time-consuming to have to work around.

Facilitating client-side writes in a safe way also requires you to write lots of
database rules for your Firestore documents, which can get very complex, so
mutating documents server-side is not only easier to reason about but also more
secure by default.

## Throwing Errors

The hooks in this library throw errors, which is not a common practice, but this
was a deliberate choice.

In my experience, runtime exceptions for Firestore documents and collection
queries are very rare. By throwing we can avoid having to handle errors, and
optimize for the happy-path.

The most common errors are:

1. An index is required but has not been created yet.
2. The document does not exist.
3. You do not have permission to read the document.

I think all of these are likely to be caught during development and testing and
should not occur in production code.

In some cases it is expected that the document might not exist, so for those
situations we have the `*Maybe` variants like `useDocumentMaybe()`. These
functions do not throw, and simply return undefined if the document does not
exist.

This approach also has a nice benefit, because now the loading state is directly
tied to the data availability. If you wait for the loading state from
`useDocument()` to become true, the Typescript compiler is also guaranteed that
the data exists.

In that sense, you do not even need the loading state at all. It would be
sufficient to simply wait for the data to become defined, but for code
readability I would still recommend using the loading state variable.

## Fork

This library is currently based on a fork of
[react-firebase-hooks](https://github.com/csfrequency/react-firebase-hooks),
which was stripped and cleaned up.

The hooks in this package are mostly a stronger-typed, more focussed abstraction
on top of the Firestore hooks from that library.

I plan to rewrite the code at some point because it can probably be simplified
and improved, but for now it allows us to rely on the functionality without
having to write tests.
