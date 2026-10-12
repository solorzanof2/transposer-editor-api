import { PublicRouting } from './adapters/handlers/publics/PublicsRouting';
import { SongRouting } from './adapters/handlers/songs/SongRouting';
import { SystemRouting } from './adapters/handlers/system/SystemRouting';


export const Routings = [
  ...SystemRouting,
  ...PublicRouting,
  ...SongRouting,
] as const;
