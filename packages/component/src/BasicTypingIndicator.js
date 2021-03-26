import { hooks } from 'botframework-webchat-api';

const { useActiveTyping, useCreateTypingIndicatorRenderer } = hooks;

function useTypingIndicatorVisible() {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).length];
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [typing] = useActiveTyping(Infinity);
  const createTypingIndicatorRenderer = useCreateTypingIndicatorRenderer();

  const renderTypingIndicator = createTypingIndicatorRenderer({ activeTyping, typing });

  return renderTypingIndicator && renderTypingIndicator();
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
