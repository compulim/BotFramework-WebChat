import { useContext } from 'react';

import ACSCredentialsContext from '../ACSCredentialsContext';

export default function useACSEndpointURL() {
  const { endpointURL } = useContext(ACSCredentialsContext);

  return [endpointURL];
}
