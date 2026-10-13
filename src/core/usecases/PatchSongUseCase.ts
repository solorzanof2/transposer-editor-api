import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SongDTO } from '../contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../contracts/responses/SongResponseDTO';
import { toSongResponseDTO } from '../contracts/responses/SongResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class PatchSongUseCase implements UseCase {

  static readonly Error = {
    SongNotFound: 'SongNotFound',
  };

  private songService: SongService = new SongService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        userId,
        songId,
        payload,
        requestId,
      } = options;

      const song = await this.songService.patch(userId, songId, payload) as SongDTO | null;

      if (!song) {
        SimpleLogger.warning(`No se encontro la cancion ${songId}.`, 'PatchSongUseCase', requestId);
        return useReject(new Error(PatchSongUseCase.Error.SongNotFound));
      }

      const response = toSongResponseDTO(song) as SongResponseDTO;

      return useResolve(response as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'PatchSongUseCase', options.requestId);
      return useReject(error);
    }
  }

}
