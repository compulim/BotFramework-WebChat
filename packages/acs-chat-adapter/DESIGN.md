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

- [Return read receipts](#return-read-receipts)
- [Receiving typing signals](#receiving-typing-signals)
- [Sending typing signals](#sending-typing-signals)
- [Metadata associated with transcript](#metadata-associated-with-transcript)

## Return read receipts

### Story

Chat UI will return read receipts when the user read activity.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

- Return one read receipt for the last message
  - Pass the ID of the last message
  - Without passing anything
- Return many read receipts for every message read

Not every activity is human-readable. Chat adapter should decide which activity to return.

### Design

```ts
declare type ChatAdapter = {
  /**
   * True, if read receipts is supported and chat adapter should return read receipts for all incoming messages, otherwise, false.
   *
   * If `undefined`, the chat adapter does not support read receipts.
   */
  honorReadReceipts?: boolean = true;

  /**
   * Sets if the chat adapter should return read receipts for all incoming messages.
   *
   * The chat adapter should return read receipts by default, unless this function is called with `false` after the chat adapter is initialized.
   *
   * If `undefined`, the chat adapter does not support read receipts.
   */
  setHonorReadReceipts?: (honorReadReceipts: boolean) => void;
};
```

If chat provider does not support read receipts, it should set both to `undefined`.

If chat provider support read receipts, it should return `true` or `false` for `honorReadReceipts`. It MUST not return `undefined` for `honorReadReceipts`.

Chat UI may temporarily pause read receipts because the UI is not in foreground or [obscurred](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState).

### Alternatives considered

```ts
declare type ChatAdapter = {
  /** Converted getter and setter of the honor read receipts. */
  honorReadReceipts?: () => boolean | (honorReadReceipts: boolean) => void;
}
```

This design is inspired from jQuery but it is not used in APIs proposed by W3C. Although it converge the "supportability of honor read receipts" feature in chat adapter, we are not selecting this design because it is not commonly known.

### Exceptions

Depends on the design of chat UI, some activities may not be rendered. They may still consider read, in the perspective of chat adapter.

## Receiving typing signals

### Story

Chat UI will show "John is typing" when it receives a typing signal from chat adapter.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

- Pulse: single type of signal
  - Send "John is typing" signal periodically, commonly, once every 3 to 10 secodns
  - If no "John is typing" signal is received for a certain period, adapter should consider John stopped typing
- Toggle: two types of signal
  - Send "John is typing" signal
  - Send "John stopped typing" signal

If the signal is sent periodically, it is up to the chat adapter or chat provider to define the period. Chat UI has no interests in this value and should not know about it.

Chat provider may also use a different protocol or API to send the display name of the user. The chat adapter must merge the display name of the user with the typing signals, before passing it to the chat UI.

### Design

```ts
declare type TypingUsers = {
  [userId: string]: {
    /** Display name of the user who is typing. */
    name?: string;
  };
};

declare type ChatAdapter = {
  /**
   * Map of users who are typing.
   *
   * If `undefined`, this chat adapter does not support listing out who are typing.
   */
  typingUsers?: TypingUsers;
};
```

Chat adapter should provide the mentioned data structure, with the display name of the user. In US, the display name is likely to be the first name of the user. In Japan, the display name is likely to be the surname of the user.

Display name differs from country to country. Chat adapter may need to know the locale to get the display name properly.

If the chat UI need to know the time when typing started, such as for debouncing or ordering purpose, the UI should perform reconciliation and mark the time itself.

### 🔥🔥🔥 Questions

- Chat adapter or provider should not know about the locale
  - It may be difficult to change the locale on-the-fly, as the chat adapter may potentially need to ask chat provider to change locale for that particular WebSocket connection
- If chat UI is going to handle the localization of names, should chat adapter pass a complex name structure?
  - It seems too complicated for normal developers

```ts
declare type TypingUsers = {
  [userId: string]: {
    name:
      | string
      | {
          first: string;
          last: string;
          surname: string;
          display: string;
        };
  };
};
```

### Exceptions

## Sending typing signals

### Story

Chat UI will send typing signal when the user is typing, inputting via voice, or by other means, such as drawing on a whiteboard.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

- Pulse: single type of signal
  - Send "user is typing" signal periodically, commonly, once every 3 to 10 seconds
  - If no "user is typing" signal is received for a certain period, provider will consider the user stopped typing
- Toggle: two types of signal
  - Send "user is typing" signal
  - Send "user stopped typing" signal

If the signal is sent periodically, it is up to the chat adapter or chat provider to define the period. Chat UI has no interests in this value and should not know about it.

### Design

```ts
declare type ChatAdapter = {
  /**
   * Emit a typing signal to the chat provider.
   *
   * If `started` is `true`, a start typing signal will be emitted. Otherwise, a stop typing signal will be emitted.
   */
  emitTyping?: (started: boolean = true) => void;
};
```

Chat UI will send two types of signal: "user is typing" and "user stopped typing":

- When the user start typing, a "user is typing" signal will be sent
- When the user completed a message by sending it, a "user stopped typing" signal will be sent
- When the user paused typing without completing a message, the chat UI will send "user stopped typing" signal after a predefined period chosen by the chat UI

If chat provider only support a single type of signal, chat adapter is responsible to perform the conversion.

### Alternatives considered

#### Send "typing stopped" by the return function

```ts
declare type ChatAdapter = {
  emitTyping?: () => void;
};
```

After calling `emitTyping`, it return another function, that can be called to send "typing stopped".

Upside: the return function can be a "reference counter", and we can have multiple `emitTyping()` "session" going on, and if all returning functions are called, it will send the final "typing stopped" signal.

Downside: if developers forget to call or lost the return function, it will be locked in the "typing started" state permanently.

#### Pulse mode

```ts
declare type ChatAdapter = {
  emitTyping?: () => void;
};
```

To keep the "typing" state, the chat UI need to call this function periodicially, for example, every 3 seconds.

Upside: typing will be automatically ended if the UI failed to call the function.

Downside: the period varies across chat adapters and chat providers. The chat UI need to know exactly what period it need. Also, it is not possible to send "typing stopped" signal. If the chat UI know the user stopped typing, such as after a message is sent, or the UI is backgrounded, there is no way to stop typing until time expired.

Another downside: the time that between a user release the last key press and the time the UI consider the user stopped typing, is a variable. And the chat adapter or chat provider will govern another variable for the periodic pulse. If these 2 time interval is not the same, other users will perceive a longer "user is typing" signal.

Although this design is common, UI/UX designers cannot actually control the timing of the signals.

### Exceptions

## Changing or persisting chat adapter

Hiding the UI but keeping the chat adapter to continue to run in the background.

In the chat UI, we need to make sure it is stateless, or its state can be derived from props.

TBD.

## Metadata associated with transcript

### Story

To assist rendering activities, we need the following metadata:

- Type of sender: `self`, `others`, `service`
- Number of readers who read this activity: `some`, `all`
- Delivery status for outgoing activity: `error`, `sending`, `sent`
- (Optional) Avatar initials and image
- (Optional) Sender display name

### Chat provider adaptations

Chat providers may support this feature in a various ways:

- Read receipts via out-of-band (OOB, e.g. in a different array)
- Delivery status by resolving the Promise returned from the send message function
- Delivery status by a different array for message failures
- Find out current user ID and match with the activity, to see if the activity was send by ourselves or others

### Design

To reduce complexity, metadata need to be attached to every activity.

For avatar initials and images, this design allow activities to show different avatar for the same sender. This enables user to change avatar during the conversation and the transcript could show different version of avatars.

To simplify read receipts, the chat adapter only need to mark if "some" or "all" participants have read the activity.

### Alternatives considered

### Exceptions

<!--

## Template for design topics

### Story

### Chat provider adaptations

Chat providers may support this feature in a various ways:

### Design

### Alternatives considered

### Exceptions

-->
