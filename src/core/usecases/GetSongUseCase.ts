import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SongDTO } from '../contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../contracts/responses/SongResponseDTO';
import { toSongResponseDTO } from '../contracts/responses/SongResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class GetSongUseCase implements UseCase {

  static readonly Error = {
    MissingUserId: 'MissingUserId',
    MissingSongId: 'MissingSongId',
    SongNotFound: 'SongNotFound',
  };

  private songService: SongService = new SongService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        userId,
        songId,
        requestId,
      } = options;

      if (!userId) {
        SimpleLogger.warning('No se recibio userId para obtener cancion.', 'GetSongUseCase', requestId);
        return useReject(new Error(GetSongUseCase.Error.MissingUserId));
      }

      if (!songId) {
        SimpleLogger.warning('No se recibio songId para obtener cancion.', 'GetSongUseCase', requestId);
        return useReject(new Error(GetSongUseCase.Error.MissingSongId));
      }

      const song = await this.songService.getById(userId, songId) as SongDTO | null;

      if (!song) {
        SimpleLogger.warning(`No se encontro la cancion ${songId}.`, 'GetSongUseCase', requestId);
        return useReject(new Error(GetSongUseCase.Error.SongNotFound));
      }

      const response = toSongResponseDTO(song) as SongResponseDTO;

      return useResolve(response as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'GetSongUseCase', options.requestId);
      return useReject(error);
    }
  }

}
