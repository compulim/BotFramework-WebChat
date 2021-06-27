import { createContext } from 'react';
import { Version } from 'adaptivecards';

import AdaptiveCardsPackage from '../types/AdaptiveCardsPackage';

type AdaptiveCardsContext = {
  adaptiveCardsPackage: AdaptiveCardsPackage;
  hostConfigFromProps: any;
  maxVersion: Version;
};

const AdaptiveCardsContext = createContext<AdaptiveCardsContext>(undefined);

export default AdaptiveCardsContext;
