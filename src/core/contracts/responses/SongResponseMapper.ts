import { SongDTO } from '../datatransfers/SongDTO';
import { Dates } from '../../helpers/DatesHelper';
import { SongResponseDTO } from './SongResponseDTO';


export const toSongResponseDTO = (song: SongDTO): SongResponseDTO => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  source: song.source,
  originalKey: song.originalKey,
  lastTargetKey: song.lastTargetKey,
  enharmonicPreference: song.enharmonicPreference,
  createdAt: song.createdAt,
  createdAtLabel: Dates.millisToLocalUserDatetime(song.createdAt),
  updatedAt: song.updatedAt,
  updatedAtLabel: Dates.millisToLocalUserDatetime(song.updatedAt),
});
