import AdaptiveCardsStyleOptions from './AdaptiveCardsStyleOptions';

const ADAPTIVE_CARDS_DEFAULT_STYLE_OPTIONS: Required<AdaptiveCardsStyleOptions> = {
  actionPerformedClassName: undefined,

  // TODO: [P1] #XXX Adaptive Cards package currently set 1.3 as default despite they support 1.4.
  //       Set this back to "undefined" when they finally move to 1.4.
  adaptiveCardsParserMaxVersion: '1.4',
  cardEmphasisBackgroundColor: '#F0F0F0',
  cardPushButtonBackgroundColor: '#0063B1',
  cardPushButtonTextColor: 'White',
  richCardWrapTitle: false
};

export default ADAPTIVE_CARDS_DEFAULT_STYLE_OPTIONS;
