# Typed Firestore - React

Elegant, strongly-typed React hooks for handling Firestore documents. This is
currently implemented as a stronger-typed, more focussed and opinionated
abstraction on top of [react-firebase-hooks]().

It uses typing similar to
[@typed-firestore/server](https://github.com/0x80/typed-firestore-server), to
unify server and client code.

## Features

- Type your collections once, and infer from that.
- Documents are [immutable by default](#immutable-by-default)
- Uses the same [FsDocument](#fsdocument) abstraction as found in
  [typed-firestore-server](https://github.com/0x80/typed-firestore-server) for
  consistency between front and backend code.
- Throws errors instead of returning them. See
  [throwing errors](#throwing-errors) for motivation.

## Installation

`pnpm add @typed-firestore/react`

## Usage

### Hooks

| Hook               | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `useDocument`      | Use a document and subscribe to changes                       |
| `useDocumentData`  | Use only the data part of a document and subscribe to changes |
| `useDocumentMaybe` | Use a document that might not exist                           |
| `useDocumentOnce`  | Use a document once and do not subscribe for changes          |
| `useCollection`    | Query a collection and subscribe for changes                  |

### Regular Functions

These might be useful for when you use something like ReactQuery and you want to
fetch a document outside of a component/hook.

| Function                          | Description                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| `getDocument`                     | Fetch a document                                               |
| `getDocumentData`                 | Fetch only the data part of a document                         |
| `getDocumentMaybe`                | Fetch a document that might not exist                          |
| `getDocumentFromTransaction`      | Fetch a document as part of a transaction                      |
| `getDocumentFromTransactionMaybe` | Fetch a document that might not exist as part of a transaction |

### Example

@TODO add text and example for refs

Then in a component you would do something like this:

```ts
import { useDocument } from "@typed-firestore/react";
import { UpdateData } from "firebase/firestore";

export function DisplayName({userId}: {userId: string}) {

const [user, isLoading] = useDocument<User>(refs.users, userId);

if (isLoading) {
  return <LoadingIndicator/>;
  }

  return <div>{user.data.displayName}</div>;
}

```

### Immutable By Default

By default the hooks do not return a ref to the document to call functions like
`update` on it.

I would recommend to do all document mutations server-side via an API endpoint,
especially if older versions of your app could be around for a while like with
react-native, because a mistake in code could have lasting effects on your data
consistency.

Facilitating client-side writes in a safe way often requires you to write
complex database rules for your Firestore documents, so mutating documents
server-side is also much easier to do securely.

The default immutable document type is:

```ts
export type FsDocument<T> = {
  id: string;
  data: T;
};
```

## Mutable Documents

```ts
export type FsDocument<T> = {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Promise<WriteResult>;
  updatePartial: (data: Partial<T>) => Promise<WriteResult>;
};
```

Or, in the case of transactions:

```ts
export type FsDocument<T> = {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Transaction;
  updatePartial: (data: Partial<T>) => Transaction;
};
```

@todo write about typed `update()`

## Throwing Errors

The hooks in this library throw errors, which is not a common practice, but I
think it is warranted in this case.

In my experience, runtime exceptions for Firestore documents and collection
queries are very rare. By throwing we can avoid having to handle errors and
loading state separately in every calling context.

The most common errors are:

- An index is required but not created yet.
- A document does not exist

Both of which are typically caught in development and testing and should not
occur in production code.

In some cases you actually know upfront that the document might not exist, so
for those instances we have the `*Maybe` variants like `useDocumentMaybe()`.
These functions do not throw but simply return undefined if the document does
not exist. In this case it is not considered an error.
