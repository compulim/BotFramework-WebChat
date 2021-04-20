export default function sequenceIdToSequenceNumber(sequenceId: number | string | undefined) {
  return typeof sequenceId === 'number'
    ? sequenceId
    : typeof sequenceId === 'string' && sequenceId
    ? +sequenceId
    : Infinity;
}
