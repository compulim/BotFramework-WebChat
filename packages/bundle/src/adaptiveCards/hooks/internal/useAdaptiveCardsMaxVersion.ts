import { Version } from 'adaptivecards';

import useAdaptiveCardsContext from './useAdaptiveCardsContext';

export default function useAdaptiveCardsMaxVersion(): [Version] {
  const { maxVersion } = useAdaptiveCardsContext();

  return [maxVersion];
}
