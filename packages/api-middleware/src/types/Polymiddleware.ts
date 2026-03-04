import { type ActivityPolymiddleware } from '../activityPolymiddleware';
import { type ErrorBoxPolymiddleware } from '../errorBoxPolymiddleware';
import { type SendBoxPolymiddleware } from '../sendBoxPolymiddleware';

export type Polymiddleware = ActivityPolymiddleware | ErrorBoxPolymiddleware | SendBoxPolymiddleware;
