import { CONNECT } from '../actions/connect';

export default function userId(state = { id: '', name: '' }, action) {
  // This is rectified user ID.
  if (action.type === CONNECT) {
    const {
      meta: { userID: id, username: name }
    } = action;

    state = { id, name };
  }

  return state;
}
