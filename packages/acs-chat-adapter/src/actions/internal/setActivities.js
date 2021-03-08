const SET_ACTIVITIES = 'ACS/SET_ACTIVITIES';

export default function setActivities(activities) {
  return {
    payload: activities,
    type: SET_ACTIVITIES
  };
}

export { SET_ACTIVITIES };
