export default function createSendStatusStyle({ fontSizeSmall, primaryFont, subtle, timestampColor }) {
  return {
    '&.webchat__activity-status': {
      color: timestampColor || subtle,
      fontFamily: primaryFont,
      fontSize: fontSizeSmall,
      paddingTop: 5,

      '& .webchat__activity-status__read-receipt': {
        marginLeft: '.2em'
      }
    }
  };
}
