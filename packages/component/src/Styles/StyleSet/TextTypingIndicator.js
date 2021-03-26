export default function createTextTypingIndicatorStyle({
  fontSizeSmall,
  paddingRegular,
  primaryFont,
  subtle,
  textTypingIndicatorColor
}) {
  return {
    '&.webchat__text-typing-indicator': {
      color: textTypingIndicatorColor || subtle,
      fontFamily: primaryFont,
      fontSize: fontSizeSmall,
      paddingBottom: paddingRegular,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular
    }
  };
}
