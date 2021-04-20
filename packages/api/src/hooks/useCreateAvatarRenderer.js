import { getMetadata } from 'botframework-webchat-core';
import { useMemo } from 'react';

import useAPIContext from './internal/useAPIContext';
import useStyleOptions from './useStyleOptions';

export default function useCreateAvatarRenderer() {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useAPIContext();

  return useMemo(
    () => ({ activity }) => {
      const result = avatarRenderer({
        activity,
        fromUser: getMetadata(activity).who === 'self',
        styleOptions
      });

      if (result !== false && typeof result !== 'function') {
        console.warn(
          'botframework-webchat: avatarMiddleware should return a function to render the avatar, or return false if avatar should be hidden. Please refer to HOOKS.md for details.'
        );

        return () => result;
      }

      return result;
    },
    [avatarRenderer, styleOptions]
  );
}
