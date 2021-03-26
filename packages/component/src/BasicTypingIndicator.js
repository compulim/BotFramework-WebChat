import { hooks } from 'botframework-webchat-api';

const { useActiveTyping, useRenderTypingIndicator, useStyleOptions } = hooks;

function useTypingIndicatorVisible() {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).length];
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [styleOptions] = useStyleOptions();
  const [typing] = useActiveTyping(Infinity);
  const createTypingIndicatorRenderer = useRenderTypingIndicator();

  const renderTypingIndicator = createTypingIndicatorRenderer({ activeTyping, styleOptions, typing });

  return renderTypingIndicator && renderTypingIndicator();
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
