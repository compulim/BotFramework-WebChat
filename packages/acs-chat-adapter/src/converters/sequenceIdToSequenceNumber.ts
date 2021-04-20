export default function sequenceIdToSequenceNumber(sequenceId: number | string | undefined): number {
  return typeof sequenceId === 'number'
    ? sequenceId
    : typeof sequenceId === 'string' && sequenceId
    ? +sequenceId
    : Infinity;
}
