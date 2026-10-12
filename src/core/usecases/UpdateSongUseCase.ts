import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SongDTO, UpdateSongRequestDTO } from '../contracts/datatransfers/SongDTO';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class UpdateSongUseCase implements UseCase {

  static readonly Error = {
    MissingUserId: 'MissingUserId',
    MissingSongId: 'MissingSongId',
    InvalidSongPayload: 'InvalidSongPayload',
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

      if (!userId) {
        SimpleLogger.warning('No se recibio userId para actualizar cancion.', 'UpdateSongUseCase', requestId);
        return useReject(new Error(UpdateSongUseCase.Error.MissingUserId));
      }

      if (!songId) {
        SimpleLogger.warning('No se recibio songId para actualizar cancion.', 'UpdateSongUseCase', requestId);
        return useReject(new Error(UpdateSongUseCase.Error.MissingSongId));
      }

      if (!this.isValidPayload(payload)) {
        SimpleLogger.warning('El payload de cancion es invalido.', 'UpdateSongUseCase', requestId);
        return useReject(new Error(UpdateSongUseCase.Error.InvalidSongPayload));
      }

      const song = await this.songService.replace(userId, songId, payload) as SongDTO | null;

      if (!song) {
        SimpleLogger.warning(`No se encontro la cancion ${songId}.`, 'UpdateSongUseCase', requestId);
        return useReject(new Error(UpdateSongUseCase.Error.SongNotFound));
      }

      return useResolve(song);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'UpdateSongUseCase', options.requestId);
      return useReject(error);
    }
  }

  private isValidPayload(payload: UpdateSongRequestDTO): boolean {
    return !!payload?.title && !!payload?.source;
  }

}
