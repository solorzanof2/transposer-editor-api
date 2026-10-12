import { Route } from '../../../deepcore/contracts/Route';
import { CreateSongHandler } from './CreateSongHandler';
import { GetSongsHandler } from './GetAllSongsHandler';
import { GetSongHandler } from './GetSongHandler';
import { UpdateSongHandler } from './UpdateSongHandler';


export const SongRouting: Route[] = [
  {
    path: '/api/v1/songs',
    method: 'get',
    handler: GetSongsHandler,
  },
  {
    path: '/api/v1/songs',
    method: 'post',
    handler: CreateSongHandler,
  },
  {
    path: '/api/v1/songs/:songId',
    method: 'get',
    handler: GetSongHandler,
  },
  {
    path: '/api/v1/songs/:songId',
    method: 'put',
    handler: UpdateSongHandler,
  },
];
