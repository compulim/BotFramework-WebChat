import { SET_ACTIVITIES } from '../actions/internal/setActivities';

export default function activities(state = [], action) {
  switch (action.type) {
    case SET_ACTIVITIES:
      state = action.payload;
      break;

    default:
      break;
  }

  return state;
}
