const POST_ACTIVITY = 'CHAT_ADAPTER/POST_ACTIVITY';
export const POST_ACTIVITY_FULFILLED = `${POST_ACTIVITY}_FULFILLED`;
export const POST_ACTIVITY_PENDING = `${POST_ACTIVITY}_PENDING`;
export const POST_ACTIVITY_REJECTED = `${POST_ACTIVITY}_REJECTED`;

export default function postActivity(activity, method = 'code') {
  return {
    type: POST_ACTIVITY,
    meta: { method },
    payload: activity
  };
}

export { POST_ACTIVITY };
