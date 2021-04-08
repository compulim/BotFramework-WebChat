import { getMetadata, updateMetadata } from 'botframework-webchat-core';

import * as hooks from './hooks';
import Composer from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import Localize, { localize } from './localization/Localize';

export { Composer, concatMiddleware, getMetadata, hooks, Localize, localize, updateMetadata };
