import { Route } from '../../../deepcore/contracts/Route';
import { GetSongsHandler } from './GetAllSongsHandler';


export const SongRouting: Route[] = [
  {
    path: '/api/v1/songs',
    method: 'get',
    handler: GetSongsHandler,
  },
];
