type AdaptiveCardInvokeResponse =
  | {
      // eslint-disable-next-line no-magic-numbers
      statusCode?: 200 | null;
      type: 'application/vnd.microsoft.card.adaptive';
      value: any; // Adaptive Card
    }
  | {
      // eslint-disable-next-line no-magic-numbers
      statusCode?: 200 | null;
      type: 'application/vnd.microsoft.activity.message';
      value: string;
    }
  | {
      // eslint-disable-next-line no-magic-numbers
      statusCode: 401;
      type: 'application/vnd.microsoft.activity.loginRequest';
      value: { loginUrl: string };
    }
  | {
      // eslint-disable-next-line no-magic-numbers
      statusCode: 429;
      type: 'application/vnd.microsoft.activity.retryAfter';
      value: number;
    }
  | {
      statusCode: number; // 400-599
      type: 'application/vnd.microsoft.error';
      value: {
        code: string;
        number: string;
      };
    };

export default AdaptiveCardInvokeResponse;
