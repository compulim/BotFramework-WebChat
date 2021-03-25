import * as hooks from './hooks';
import Composer from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import fromWho from './utils/fromWho';
import getActivityKey from './utils/getActivityKey';
import getMetadata from './utils/getMetadata';
import Localize, { localize } from './localization/Localize';

export { Composer, concatMiddleware, fromWho, getActivityKey, getMetadata, hooks, Localize, localize };
