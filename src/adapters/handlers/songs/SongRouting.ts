import { Route } from '../../../deepcore/contracts/Route';
import { GetSongsHandler } from './GetAllSongsHandler';
import { GetSongHandler } from './GetSongHandler';


export const SongRouting: Route[] = [
  {
    path: '/api/v1/songs',
    method: 'get',
    handler: GetSongsHandler,
  },
  {
    path: '/api/v1/songs/:songId',
    method: 'get',
    handler: GetSongHandler,
  },
];
