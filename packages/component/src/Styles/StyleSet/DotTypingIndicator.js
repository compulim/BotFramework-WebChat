export default function createDotTypingIndicatorStyle({ paddingRegular }) {
  return {
    '&.webchat__dot-typing-indicator': {
      paddingBottom: paddingRegular,

      '&:not(.webchat__dot-typing-indicator--rtl)': {
        paddingLeft: paddingRegular
      },

      '&.webchat__dot-typing-indicator--rtl': {
        paddingRight: paddingRegular
      }
    }
  };
}
