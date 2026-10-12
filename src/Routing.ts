import { PublicRouting } from './adapters/handlers/publics/PublicsRouting';
import { SystemRouting } from './adapters/handlers/system/SystemRouting';


export const Routings = [
  ...SystemRouting,
  ...PublicRouting,
] as const;

