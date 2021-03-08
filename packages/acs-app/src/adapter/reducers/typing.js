// TODO: Chat adapter owns the "timeout for typing".
//       That means, Web Chat cannot assume "5s after last typing" will end the typing.

// TODO: Rename this to "typing".

import { SET_TYPING } from '../actions/internal/setTyping';

const DEFAULT_STATE = {};

export default function typing(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_TYPING:
      state = payload;
      break;

    default:
      break;
  }

  return state;
}

// export default function lastTyping(state = DEFAULT_STATE, { payload, type }) {
//   if (type === INCOMING_ACTIVITY || type === POST_ACTIVITY_PENDING) {
//     const {
//       activity: {
//         from: { id, name, role },
//         type: activityType
//       }
//     } = payload;

//     if (activityType === 'typing') {
//       state = updateIn(state, [id], () => ({
//         at: Date.now(),
//         name,
//         role
//       }));
//     } else if (activityType === 'message') {
//       state = updateIn(state, [id]);
//     }
//   }

//   return state;
// }
