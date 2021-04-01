# Design

## Terminology

| Name                    | Description                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Chat adapter            | The adapter for integrating the chat service and chat UI.                                                                    |
| Chat provider           | The provider for chat service.                                                                                               |
| Chat UI                 | The UI for chatting between users.                                                                                           |
| Message                 | A textual message, probably readable by human user.                                                                          |
| Activity                | Any exchange between chat provider and chat client. Could be a message, binary data. Could be temporal or non-temporal data. |
| User                    | A human user, a conversational chatbot (read-write), or a secretarial agent (read-only).                                     |
| Outgoing activity       | An activity sent by the user represented by the chat UI.                                                                     |
| Local-outgoing activity | An outgoing activity which is sent during the current UI session.                                                            |

# Topics

-  [Return read receipts](#return-read-receipts)
-  [Receiving typing signals](#receiving-typing-signals)
-  [Sending typing signals](#sending-typing-signals)

## Return read receipts

### Story

Chat UI will return read receipts when the user read activity.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Return one read receipt for the last message
   -  Pass the ID of the last message
   -  Without passing anything
-  Return many read receipts for every message read

Not every activity is human-readable. Chat adapter should decide which activity to return.

### Design

```ts
{
  /**
   * True, if read receipts is supported and chat adapter should return read receipts for all incoming messages, otherwise, false.
   *
   * If `undefined`, the chat adapter does not support read receipts.
   */
  honorReadReceipts?: boolean;

  /**
   * Sets if the chat adapter should return read receipts for all incoming messages.
   *
   * If `undefined`, the chat adapter does not support read receipts.
   */
  setHonorReadReceipts?: (honorReadReceipts: boolean) => void;
}
```

If chat provider does not support read receipts, it should set both to `undefined`.

If chat provider support read receipts, it should return `true` or `false` for `honorReadReceipts`. It MUST not return `undefined` for `honorReadReceipts`.

Chat UI may temporarily pause read receipts because the UI is not in foreground or [obscurred](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState).

### Exceptions

Depends on the design of chat UI, some activities may not be rendered. They may still consider read, in the perspective of chat adapter.

## Receiving typing signals

### Story

Chat UI will show "John is typing" when it receives a typing signal from chat adapter.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Single type of signal
   -  Send "John is typing" signal periodically, commonly, once every 3 to 10 secodns
   -  If no "John is typing" signal is received for a certain period, adapter should consider John stopped typing
-  Two types of signal
   -  Send "John is typing" signal
   -  Send "John stopped typing" signal

If the signal is sent periodically, it is up to the chat adapter or chat provider to define the period. Chat UI has no interests in this value and should not know about it.

Chat provider may also use a different protocol or API to send the display name of the user. The chat adapter must merge the display name of the user with the typing signals, before passing it to the chat UI.

### Design

```ts
declare type TypingUsers {
  [userId: string]: {
    /** Display name of the user who is typing */
    name?: string;
  };
}
```

Chat adapter should provide the mentioned data structure, with the display name of the user. In US, the display name is likely to be the first name of the user. In Japan, the display name is likely to be the surname of the user.

Display name differs from country to country. Chat adapter may need to know the locale to get the display name properly.

### 🔥🔥🔥 Questions

-  Chat adapter or provider should not know about the locale
   -  It may be difficult to change the locale on-the-fly, as the chat adapter may potentially need to ask chat provider to change locale for that particular WebSocket connection
-  If chat UI is going to handle the localization of names, should chat adapter pass a complex name structure?
   -  It seems too complicated for normal developers

```ts
{
  [userId: string]: {
    name: string | {
      first: string;
      last: string;
      surname: string;
      display: string;
    };
  }
}
```

### Exceptions

## Sending typing signals

### Story

Chat UI will send typing signal when the user is typing, inputting via voice, or by other means, such as drawing on a whiteboard.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Single type of signal
   -  Send "user is typing" signal periodically, commonly, once every 3 to 10 seconds
   -  If no "user is typing" signal is received for a certain period, provider will consider the user stopped typing
-  Two types of signal
   -  Send "user is typing" signal
   -  Send "user stopped typing" signal

If the signal is sent periodically, it is up to the chat adapter or chat provider to define the period. Chat UI has no interests in this value and should not know about it.

### Design

```ts
/**
 * Emit a typing signal to the chat provider.
 *
 * If `started` is `true` or `undefined`, a start typing signal will be emitted. Otherwise, a stop typing signal will be emitted.
 */
declare function emitTyping(started?: boolean = true): void;
```

Chat UI will send two types of signal: "user is typing" and "user stopped typing":

-  When the user start typing, a "user is typing" signal will be sent
-  When the user completed a message by sending it, a "user stopped typing" signal will be sent
-  When the user paused typing without completing a message, the chat UI will send "user stopped typing" signal after a predefined period
   -  The period is defined by the chat UI

If chat provider only support a single type of signal, chat adapter is responsible to perform the conversion.

### Exceptions

## Changing or persisting chat adapter

## Template

### Story

### Chat provider adaptations

Chat providers may support this feature in a various ways:

### Design

### Exceptions
