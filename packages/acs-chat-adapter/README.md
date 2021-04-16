```ts
const styleOptions = {
   accent: 'orange'
};

ReactDOM.render(
   <ACSChatAdapter endpointURL="https://my-acs.communication.azure.com/" token="a1b2c3d">
      {(...chatAdapterProps) => <ReactWebChat {...chatAdapterProps} styleOptions={styleOptions} />}
   </ACSChatAdapter>
);
```

# Notes

-  `styleOptions.sendTimeout` and `styleOptions.sendTimeoutForAttachments`
   -  Does not applies to ACS chat adapter
   -  Breaking: now it only applies to next `postActivity`, previously allowed to set on-the-fly
-  Resolved #2869
   -  `// TODO: [P2] #2869 This "contentURL" removal code should be moved to DirectLineJS adapter.`

# To-do

-  Modify `styleOptions`
   -  Show/hide avatar, `showAvatarForOthers`, `showAvatarForSelf`
-  Update legacy chat adapter
-  For UI, should we fallback to user ID for username? So it's easier to use by default

# Terminology

-  Transcript = all messages, a.k.a. result of `useChatMessages()`
-  Outgoing message = the message pending or sent by the current user, could be in current browser session or previous/other browser sessions
-  Local-outgoing message = the message sent by the current browser session
-  Local transcript vs. remote transcript = in ACS, not everyone share the same view of transcript, e.g. local-outgoing message that had not arrived at the service side yet

# Feedbacks

-  3 functions need to be called to subscribe to live changes of values, the code pattern is too intricated:
   -  `useFetchXXX` to fetch initial values
   -  `useSubscribeXXX` to subscribe for changes
   -  `useXXX` to get all values (initial + changes)
-  Cannot subscribe to live changes on "chat thread members"
-  `<ChatProvider>` will show a loading screen when it is pending connection, not needed
-  Typing notification need to be ended sooner after the sender has sent the message
-  If end-dev want to implement auto retry on "fail to send message", how?
   -  Should this feature provided by SDK? Or coded by end-dev?
   -  If it is provided by SDK, is there a flag to turn it off for manual retry?
-  `displayName` props in `<ChatProvider>` seems useless
-  `useTypingUsers()` requires passing thread members list, not well understood complexity
-  Merging of metadata (username, delivery status, etc)
   -  It is very common for UI to show username and some metadata, next to the message
   -  If they are not merged beforehand, in the transcript, when we show chat message + username, either result of `useChatMessages` or `useChatThreadMembers` changed, will trigger a re-render of the whole transcript
      -  Someone joined the chat, will requires everyone to re-render the transcript
   -  Merging is a delicate art: if merged carefully, no impact on perf. If merged naively, will bring great impact on perf. Both have same result
   -  End-dev using SDK is less likely to spend time on merging, and more likely to introduce perf impact
   -  Better for SDK to merge metadata and improve end-dev's life and reduce likelihood of UI perf impact

New feedbacks:

-  Recommend to use `EventTarget` instead of `onStateChange`/`offStateChange`
-  `sequenceId` is a string, but the content is a number
-  Event listener code will be much simpler if it allow us to "add event listener" before async completion of "startRealtimeNotifications"
   -  What's more, it is weird to throw exception on attaching event listeners

## Regarding send message function signature

-  Sending a message is a multi-stage process
   -  Queued (in browser memory, not appears in local transcript yet)
   -  Sending (on the wire, appears in local transcript)
   -  Sent (ACK-ed from service)
-  Errors can happen at any stages
-  For UI, all error handling will be the same: show "Send failed" and probably retry prompt
-  But, today, handling errors at different stage requires different code on UI side
-  I found the most useful patterns:
   -  `sendMessage()` will synchronously return a "tracking number" after it is queued
      -  `sendMessage()` should not throw errors, i.e. this function should succeed unless there is a bug in SDK
   -  Every local-outgoing message in the transcript must contains a tracking number
   -  On fail, end-dev can call `useResend(): (trackingNumber: string) => string` to resend the message and get a new tracking number (it's also okay to return the same tracking number)
      -  Resend logic is responsible to update the local-outgoing message in the transcript
-  Few UI/UX stories:
   -  "Send failed, retry" prompt (Web Chat story)
      -  When the user send a message, the message appears on the transcript immediately with "Sending" status, then become "Send failed, retry" on fail, or a timestamp when it's sent
      -  To sum up: support retry and update transcript accordingly
   -  Handle sending/failed in send box
      -  When the user send a message, the message stay inside the send box and is grayed out (indicate sending). The local-outgoing message do not appear in the transcript.
      -  If it failed to send, the send box will be enabled again, the message don't
         appear in the transcript either. The user can type a different message (i.e. not a retry but a new message)
      -  This story also applies to home assistant or smart home display
      -  To sum up: ability to hide the local-outgoing message in transcript

## Regarding returning read receipt

-  For UI, we always return read receipt if the UI is not in background
   -  In HTML, based on `document.onvisibilitychange` event
-  Simpler if SDK can provide a toggle flag to turn on auto return of read receipts
-  Different chat protocols may return read receipts in different ways: some return only the last message in batch, some return every message received
-  SDK know "which messages has returned"
-  It is simpler for SDK to implement this return mechanism as it know which message need to be returned
