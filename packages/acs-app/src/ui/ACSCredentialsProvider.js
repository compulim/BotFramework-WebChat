import React from 'react';

const ACSCredentialsProvider = ({ children, endpointURL, token }) => {
  const context = useMemo(
    () => ({
      endpointURL,
      token
    }),
    [endpointURL, token]
  );

  return <ACSCredentialsProvider value={context}>{children}</ACSCredentialsProvider>;
};

export default ACSCredentialsProvider;
