import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { PatchSongRequestDTO, SongDTO } from '../contracts/datatransfers/SongDTO';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class PatchSongUseCase implements UseCase {

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
        SimpleLogger.warning('No se recibio userId para editar cancion.', 'PatchSongUseCase', requestId);
        return useReject(new Error(PatchSongUseCase.Error.MissingUserId));
      }

      if (!songId) {
        SimpleLogger.warning('No se recibio songId para editar cancion.', 'PatchSongUseCase', requestId);
        return useReject(new Error(PatchSongUseCase.Error.MissingSongId));
      }

      if (!this.isValidPayload(payload)) {
        SimpleLogger.warning('El payload parcial de cancion es invalido.', 'PatchSongUseCase', requestId);
        return useReject(new Error(PatchSongUseCase.Error.InvalidSongPayload));
      }

      const song = await this.songService.patch(userId, songId, payload) as SongDTO | null;

      if (!song) {
        SimpleLogger.warning(`No se encontro la cancion ${songId}.`, 'PatchSongUseCase', requestId);
        return useReject(new Error(PatchSongUseCase.Error.SongNotFound));
      }

      return useResolve(song);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'PatchSongUseCase', options.requestId);
      return useReject(error);
    }
  }

  private isValidPayload(payload: PatchSongRequestDTO): boolean {
    return !!payload && Object.keys(payload).length > 0;
  }

}
