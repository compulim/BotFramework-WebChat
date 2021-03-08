import { useContext } from 'react';

import ACSCredentialsContext from '../ACSCredentialsContext';

export default function useACSToken() {
  const { token } = useContext(ACSCredentialsContext);

  return [token];
}
