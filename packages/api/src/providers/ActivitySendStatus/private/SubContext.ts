import { createContext, useContext } from 'react';

// Smaller context for lesser chance of update.
type ActivitySendStatusSubContextType = {
  readonly isSendingState: readonly [boolean];
};

const ActivitySendStatusSubContext = createContext<ActivitySendStatusSubContextType>(
  // This is intentionally casted to `undefined`. We will do the checking in `useContext`.
  undefined as unknown as ActivitySendStatusSubContextType
);

function useActivitySendStatusSubContext(): ActivitySendStatusSubContextType {
  return useContext(ActivitySendStatusSubContext);
}

export default ActivitySendStatusSubContext;

export { useActivitySendStatusSubContext, type ActivitySendStatusSubContextType };
