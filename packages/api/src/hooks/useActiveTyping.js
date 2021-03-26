import { useEffect } from 'react';

import useForceRender from './internal/useForceRender';
import useStyleOptions from './useStyleOptions';
import useWebChatTypingContext from './internal/useWebChatTypingContext';

function useActiveTyping(expireAfter) {
  const now = Date.now();

  const [{ typingAnimationDuration }] = useStyleOptions();
  const { typingUsers } = useWebChatTypingContext();
  const forceRender = useForceRender();

  if (typeof expireAfter !== 'number') {
    expireAfter = typingAnimationDuration;
  }

  const activeTyping = Object.entries(typingUsers).reduce((activeTyping, [id, { at, ...others }]) => {
    const until = at + expireAfter;

    if (until > now) {
      return { ...activeTyping, [id]: { at, ...others, expireAt: until } };
    }

    return activeTyping;
  }, {});

  const earliestExpireAt = Math.min(...Object.values(activeTyping).map(({ expireAt }) => expireAt));
  const timeToRender = earliestExpireAt && earliestExpireAt - now;

  useEffect(() => {
    if (timeToRender && isFinite(timeToRender)) {
      const timeout = setTimeout(forceRender, Math.max(0, timeToRender));

      return () => clearTimeout(timeout);
    }
  }, [forceRender, timeToRender]);

  return [activeTyping];
}

export default useActiveTyping;
