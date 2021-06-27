import { normalizeStyleOptions, StrictStyleOptions } from 'botframework-webchat-api';
import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import PropTypes from 'prop-types';
import React, { FC, ReactNode, useMemo } from 'react';

import { StrictAdaptiveCardsStyleOptions } from './AdaptiveCardsStyleOptions';
import AdaptiveCardsContext from './AdaptiveCardsContext';
import AdaptiveCardsPackage from '../types/AdaptiveCardsPackage';
import FullBundleStyleOptions from '../types/FullBundleStyleOptions';
import normalizeAdaptiveCardsStyleOptions from './normalizeStyleOptions';

type AdaptiveCardsComposerProps = {
  adaptiveCardsHostConfig: any;
  adaptiveCardsPackage: AdaptiveCardsPackage;
  children: ReactNode;
  styleOptions: FullBundleStyleOptions;
};

const AdaptiveCardsComposer: FC<AdaptiveCardsComposerProps> = ({
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  children,
  styleOptions
}) => {
  const patchedAdaptiveCardsPackage = useMemo(() => adaptiveCardsPackage || defaultAdaptiveCardsPackage, [
    adaptiveCardsPackage
  ]);

  const strictOptions: StrictStyleOptions & StrictAdaptiveCardsStyleOptions = {
    ...normalizeStyleOptions(styleOptions),
    ...normalizeAdaptiveCardsStyleOptions(styleOptions)
  };

  const maxVersion = useMemo(() => {
    const { SerializationContext, Version } = patchedAdaptiveCardsPackage;
    const maxVersion = Version.parse(strictOptions.adaptiveCardsParserMaxVersion, new SerializationContext());

    if (maxVersion && !maxVersion.isValid) {
      console.warn('botframework-webchat: "adaptiveCardsParserMaxVersion" specified is not a valid version.');

      return;
    }

    return maxVersion;
  }, [strictOptions.adaptiveCardsParserMaxVersion, patchedAdaptiveCardsPackage]);

  const adaptiveCardsContext = useMemo(
    () => ({
      adaptiveCardsPackage: patchedAdaptiveCardsPackage,
      hostConfigFromProps: adaptiveCardsHostConfig,
      maxVersion
    }),
    [adaptiveCardsHostConfig, patchedAdaptiveCardsPackage, maxVersion]
  );

  return <AdaptiveCardsContext.Provider value={adaptiveCardsContext}>{children}</AdaptiveCardsContext.Provider>;
};

AdaptiveCardsComposer.defaultProps = {
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  children: undefined
};

AdaptiveCardsComposer.propTypes = {
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  children: PropTypes.any,
  styleOptions: PropTypes.any.isRequired
};

export default AdaptiveCardsComposer;
