import { Route } from '../../../deepcore/contracts/Route';
import { CreateSongHandler } from './CreateSongHandler';
import { DeleteSongHandler } from './DeleteSongHandler';
import { GetSongsHandler } from './GetAllSongsHandler';
import { GetSongHandler } from './GetSongHandler';
import { PatchSongHandler } from './PatchSongHandler';
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
  {
    path: '/api/v1/songs/:songId',
    method: 'patch',
    handler: PatchSongHandler,
  },
  {
    path: '/api/v1/songs/:songId',
    method: 'delete',
    handler: DeleteSongHandler,
  },
];
