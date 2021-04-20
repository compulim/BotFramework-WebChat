# Design

## Terminology

| Name                            | Description                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Chat adapter                    | The adapter for integrating the chat service and chat UI.                                                                    |
| Chat provider                   | The provider for chat service.                                                                                               |
| Chat UI                         | The UI for chatting between users, primarily Web Chat.                                                                       |
| Message                         | A textual message, probably readable by human user.                                                                          |
| Activity                        | Any exchange between chat provider and chat client. Could be a message, binary data. Could be temporal or non-temporal data. |
| User                            | A human user, a conversational chatbot (read-write), or a secretarial agent (read-only).                                     |
| Outgoing activity               | An activity sent by the user represented by the chat UI.                                                                     |
| Local-outgoing activity         | An outgoing activity which is sent during the current UI session.                                                            |
| Pending local-outgoing activity | An outgoing activity which is not completely sent in the current UI session.                                                 |

# Topics

-  [Return read receipts](#return-read-receipts)
-  [Receiving typing signals](#receiving-typing-signals)
-  [Sending typing signals](#sending-typing-signals)
-  [Metadata associated with transcript](#metadata-associated-with-transcript)
-  [Resending activity](#resending-activity)
-  [All activities must have persistent key](#all-activities-must-have-persistent-key)
-  [Supporting local-outgoing activity](#supporting-local-outgoing-activity)

## Assumptions

-  Chat adapter must provide the ID of the user
-  Chat providers must provide the ID of the sender for every activity

## Differences between a human-to-bot conversation and a multi-human conversations

The differences between two types of conversation affect the design of the UI and protocols.

| Bot-to-human                                                                                               | Multi-human (optional with a bot)                                                     |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Instant messaging: messages are exchanged instantly                                                        | Messages exchanged are delayed due to "think time", typing, or responsiveness         |
| Sequential: message flow is similar to question and answer, only need to understand the last message       | Chaotic: message flow is freeform, a full understanding of the conversation is needed |
| Conversation often start from sketch and is task-oriented, restoring from conversation history is optional | Conversation may start by joining the ongoing conversation                            |

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

Chat UI may temporarily pause read receipts when the UI is not in foreground or [obscurred](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState). The UI will call `setHonorReadReceipts` with `false` to pause and `true` to resume.

### Alternatives considered

```ts
declare type ChatAdapter = {
  /** Converted getter and setter of the honor read receipts. */
  honorReadReceipts?: () => boolean | (honorReadReceipts: boolean) => void;
}
```

This design is inspired from jQuery but it is not used in APIs proposed by W3C. Although it converge the "supportability of honor read receipts" feature in chat adapter, we are not selecting this design because it is not commonly known.

### Special cases

Depends on the design of chat UI, some activities may not be rendered. They may still consider read, in the perspective of chat adapter.

## Receiving typing signals

### Story

Chat UI will show "John is typing" when it receives a typing signal from chat adapter.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Pulse: single type of signal
   -  Send "John is typing" signal periodically, commonly, once every 3 to 10 secodns
   -  If no "John is typing" signal is received for a certain period, adapter should consider John stopped typing
-  Toggle: two types of signal
   -  Send "John is typing" signal
   -  Send "John stopped typing" signal

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

Chat adapter should provide the mentioned data structure, with the display name of the user. It will be up to the chat adapter to provide a display name good for the locale the developer selected.

If the chat UI need to know the time when typing started, such as for debouncing or ordering purpose, the UI should perform reconciliation and mark the time itself.

### Special cases

## Sending typing signals

### Story

Chat UI will send typing signal when the user is typing, inputting via voice, or by other means, such as drawing on a whiteboard.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Pulse: single type of signal
   -  Send "user is typing" signal periodically, commonly, once every 3 to 10 seconds
   -  If no "user is typing" signal is received for a certain period, provider will consider the user stopped typing
-  Toggle: two types of signal
   -  Send "user is typing" signal
   -  Send "user stopped typing" signal

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

-  When the user start typing, a "user is typing" signal will be sent
-  When the user completed a message by sending it, a "user stopped typing" signal will be sent
-  When the user paused typing without completing a message, the chat UI will send "user stopped typing" signal after a predefined period chosen by the chat UI

If chat provider only support a single type of signal, chat adapter is responsible to perform the conversion.

-  When `emitTyping(true)` is called, the chat adapter should periodically emit the pulse signal to the chat provider based on a period published by the chat provider spec;
-  When `emitTyping(false)` is called, the chat adapter should stop emitting the pulse signal periodically.

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

### Special cases

## Metadata associated with transcript

### Story

To assist rendering activities, we need the following metadata:

-  Type of sender: `self`, `others`, `service`
-  (Optional) Number of readers who read this activity: `some`, `all`
-  (Optional) Delivery status for outgoing activity: `error`, `sending`, `sent`
-  (Optional) Avatar initials and image
-  (Optional) Sender display name
-  (Optional) Tracking number, for resending the activity on failures

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Read receipts via out-of-band (OOB, such as in a different transport or response)
-  Delivery status by resolving the Promise returned from the send message function
-  Delivery status by a different array for message failures
-  Find out current user ID and match with the activity, to see if the activity was send by ourselves or others

### Design

```ts
type BaseActivity = {
   channelData: Expando<{
      /** Delivery status. If the provider does not support delivery report, must set to "sent". */
      'webchat:delivery-status'?: 'error' | 'sending' | 'sent';

      /** Read by who. If undefined, it is not read by anyone, or the provider does not support read receipts. */
      'webchat:read-by'?: 'some' | 'all';

      /** Avatar image of the sender. */
      'webchat:sender:image'?: string;

      /** Avatar initials of the sender. */
      'webchat:sender:initials'?: string;

      /** Display name of the sender. Set to "__BOT__" if the sender is an unnamed bot. */
      'webchat:sender:name'?: string | '__BOT__';

      /** Tracking number. If undefined, the activity was sent from another session, or the chat adapter does not support resend. */
      'webchat:tracking-number'?: string;

      /** Who the activity is send by. */
      'webchat:sender:who': 'self' | 'others' | 'service';
   }>;
};
```

To reduce complexity, metadata should be attached to every activity.

For avatar initials and images, this design allow activities to show different avatar for the same sender. This enables user to change avatar during the conversation and the transcript could show different version of avatars.

To simplify read receipts, the chat adapter only need to mark if "some" or "all" participants have read the activity.

### Alternatives considered

```ts
declare type ChatAdapter = {
   activities: Activity[];

   deliveryReports: {
      [activityKey: string]: 'error' | 'sending' | 'sent';
   };

   readReceipts: {
      [activityKey: string]: string[];
   };

   userProfiles: {
      [userId: string]: {
         image?: string;
         initials?: string;
         name?: string;
         role: 'self' | 'others' | 'service';
      };
   };

   trackingNumbers: {
      [trackingNumber: string]: string;
   };
};
```

This structure is the reverse of "attach metadata to every activity". It is significantly more complicated than the chosen approach.

It does not support activities from same sender with different avatar images without making it more complex.

<!-- For most developers, merging different data structure while keeping immutability is not trivial. If immutability is not doing correctly, it may cause either: activity not showing its updates, or performance impact. -->

### Special cases

## Resending activity

### Story

If the network or service is offline while the user trying to send a message, we should show a "Send failed. Retry." prompt if the chat adapter supports resending activity. Otherwise, we should show a "Send failed." prompt.

This story is to enable chat UI to show a button for the end-user to selectively resend activities. This story is not targetting auto-resend scenario.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Chat provider may not provide a meaningful ID before the activity is successfully sent
   -  Chat adapter is responsible to identifying every activity with a "client activity ID"
   -  In worst case where chat provider provides no ID to associate the sending activity in the transcript, use this mechanism to find out the association
      1. Queue the outgoing activity on the network layer
      1. Pause all other sends
      1. Wait until the chat provider updated the transcript with an activity from us
      1. Assume the activity is the one we just sent
      1. Resume the next send

If the chat adapter have an internal "client activity ID", it can also reuse that value as the tracking number.

### Design

```ts
declare type ChatAdapter = {
   /**
    * Sends a text message with guaranteed delivery.
    *
    * @return {string} - A tracking number for tracking send status and for retries on failures.
    */
   sendMessage: (message: string) => string;

   /**
    * Resend a activity which failed to send.
    *
    * @param {string} trackingNumber - The tracking number of the activity which failed to send.
    */
   resend: (trackingNumber: string) => string;

   sendEvent: (name: string, value: any) => string;
   sendFiles: (files: (Blob | File)[]) => string;
   sendMessageBack: (value: any, text: string, displayText: string) => string;
   sendPostBack: (value: any) => string;
};
```

On sending any types of activity with guaranteed delivery, the chat adapter must provide a "tracking number" synchronously. Guaranteed delivery is equals to send receipts.

The chat adapter must have a way to notify the chat UI in case of send failures, by presenting the tracking number.

The chat UI can request a resend by presenting the tracking number. In this case, it is optional for the chat adapter to create a new tracking number or reuse the existing one. If a new tracking number is provided, it must be provided in a synchronous manner.

On resend, the chat adapter is responsible to update the local-outgoing activity, such as, updating [the delivery status and the tracking number](metadata-associated-with-transcript).

This design allows the chat adapter to store failing activities in client storage and restore them on another page session.

### Alternatives considered

```ts
declare type ChatAdapter = {
   /**
    * Send a text message. Resolved means the message has received a send receipt from the chat provider.
    *
    * @param {() => void} onQueued - A callback, when called, indicates the message is queued or being sent on the underlying protocol.
    */
   sendMessage: (message: string, onQueued: () => void) => Promise<void>;
};
```

This pattern have 2 issues:

-  It is difficult for the chat UI to associate the Promise rejection to an activity in the transcript array;
-  Resend means the chat UI will send another message with the same content. Without a key, it is difficult for chat adapter to dedupe it in the transcript array.

### Special cases

## All activities must have persistent key

### Story

All activity must have a key that never change during the lifetime of the activity.

If the key is changed, to the chat UI, it means a deletion of an activity, plus an addition of an activity. And this will affect accessibility of the chat UI as the activity will get narrated twice.

We call it a "key" instead of "ID" to emphasize the immutability of the value. This share the same philosophy with the "key" prop used in React.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Local-outgoing activity may not have a key before send receipt from the chat provider
   -  Chat adapter must generate a key when the local-outgoing activity appears in the transcript
   -  Chat adapter must track transcript updates from the chat provider and correlate it with the local-outgoing activity correctly, so the keep will not be changed
   -  Despite the chat provider may provide a new server-generated ID for the local-outgoing activity, the chat adapter must keep the key it generated when the activity first appears in the transcript
-  Chat adapter may also opt out from supporting local-outgoing activity
   -  All activities appears in the transcript are from the chat provider and should also appears in transcripts of other participants
   -  Chat adapter can use the server-generated ID as a key

### Design

For adapters that put the local-outgoing activity in the transcript:

-  When the local-outgoing activity appear in the transcript, the chat adapter must generate a "client activity ID" as the key;
-  When the activity is echoed back from the chat provider, despite the activity might have a new server-generated ID, the chat adapter must continue to use the "client activity ID" as the key.

For adapter that does not put the local-outgoing activity in the transcript:

-  Use the server-generated ID as the key

### Alternatives considered

### Special cases

On page refresh, activities will be redownloaded from the chat provider, thus, all "client activity ID" will be lost, and replaced by a server-generated ID.

## Supporting local-outgoing activity

### Story

To improve UX, the local-outgoing activity should appears in the transcript as soon as possible.

Some chat adapters, may opt out of local-outgoing activity because of its extra complexity.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Chat provider may return an ID as soon as the activity is sent, then a delivery report later
-  Chat provider may return an ID when the activity is sent to all participants

### Design

When an activity is being sent, the chat adapter must put the local-outgoing activity in the transcript immediately, along with a [persistent key](#all-activities-must-have-persistent-key).

When the chat provider provides an update to the activity, the chat adapter must kept the same persistent key

It is up to the chat adapter to decide whether a page refresh will flush all pending local-outgoing activities. Or keep them on the page via client storage.

### Alternatives considered

Chat UI to provide local-outgoing activity storage.

Downside: all pending local-outgoing activities will be flushed on page refresh because the chat UI is designed to have a non-requirement on any forms of client storage. Chat adapter is designed for storage. It is not the best interests of the chat UI to provide storage.

### Special cases

If the chat adapter do not support local-outgoing activity, it should not support resend. This is because the activity does not appear in the transcript, there is no UI to allow the end-user to resend the activity.

The chat UI cannot use capability detection to detect if the chat adapter supports local-outgoing activity or not.

## Conversation history

### Story

Messages that were received as part of the conversation history, should be skipped by screen reader. Only ongoing messages should be narrated.

### Chat provider adaptations

Chat providers may support this feature in a various ways:

-  Conversation history are sent on connect
-  Conversation history are sent on request
-  Page size of history can be specified (setting to 0 means no history should be loaded)

### Design

When an activity is received, the chat adapter need to specify if it is from previous session or not.

If it is from previous session, the chat UI will skip narration of these activities as part of the live region. However, these activities are still narrated when the end user is navigating through the transcript.

### Alternatives considered

TBD.

### Special cases

## Changing or persisting chat adapter

Hiding the UI but keeping the chat adapter to continue to run in the background.

In the chat UI, we need to make sure it is stateless, or its state can be derived from props.

TBD.

<!--

## Template for design topics

### Story

### Chat provider adaptations

Chat providers may support this feature in a various ways:

### Design

### Alternatives considered

### Special cases

-->
