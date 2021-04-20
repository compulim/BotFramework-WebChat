import { useContext } from 'react';

import CardActionContext from '../../contexts/CardActionContext';

export default function useCardActionContext() {
  const context = useContext(CardActionContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
