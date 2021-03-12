export default function acsReadReceiptsToWebChatReadAts(acsReadReceipts) {
  return (
    acsReadReceipts &&
    acsReadReceipts.reduce(
      (result, { readOn, sender: { communicationUserId } }) => ({
        ...result,
        [communicationUserId]: readOn
      }),
      {}
    )
  );
}
