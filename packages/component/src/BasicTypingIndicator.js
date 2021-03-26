import { hooks } from 'botframework-webchat-api';

const { useActiveTyping, useRenderTypingIndicator, useStyleOptions } = hooks;

// TODO: Chat adapter should not send typing with self. We can do validations in TypingComposer.js.
function useTypingIndicatorVisible() {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).filter(({ role }) => role !== 'user').length];
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [styleOptions] = useStyleOptions();
  const [visible] = useTypingIndicatorVisible();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  // TODO: Remove "visible", return false instead.
  return renderTypingIndicator({ activeTyping, styleOptions, typing, visible });
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
