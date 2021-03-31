# Design

## Terminology

| Name          | Description                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Chat provider | The provider for chat service.                                                                                               |
| Message       | A textual message.                                                                                                           |
| Activity      | Any exchange between chat provider and chat client. Could be a message, binary data. Could be temporal or non-temporal data. |

## Return read receipts

### Story

Chat UI will return read receipts when the user read activity.

### Chat provider adaptations

Chat providers may support this feature in various ways:

-  Return one read receipt for the last message
   -  Pass the ID of the last message
   -  Without passing anything
-  Return many read receipts for every message read

Not every activity is human-readable. Chat adapter should decide which activity to return.

### Design

```ts
{
  honorReadReceipts?: boolean;
  setHonorReadReceipts?: (nextHonorReadReceipts: boolean) => void;
}
```

If chat provider does not support read receipts, it should set both to `undefined`.

If chat provider support read receipts, it should return `true` or `false` for `honorReadReceipts`. It MUST not return `undefined` for `honorReadReceipts`.

Chat UI may temporarily pause read receipts because the UI is not in foreground or [obscurred](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState).

### Exceptions

Depends on the design of chat UI, some activities may not be rendered. They may still consider read, in the perspective of chat adapter.

## Template

### Story

### Chat provider adaptations

Chat providers may support this feature in various ways:

### Design

### Exceptions
