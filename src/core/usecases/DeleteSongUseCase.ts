import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class DeleteSongUseCase implements UseCase {

  static readonly Error = {
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

      const deleted = await this.songService.delete(userId, songId) as boolean;

      if (!deleted) {
        SimpleLogger.warning(`No se encontro la cancion ${songId}.`, 'DeleteSongUseCase', requestId);
        return useReject(new Error(DeleteSongUseCase.Error.SongNotFound));
      }

      return useResolve(true as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'DeleteSongUseCase', options.requestId);
      return useReject(error);
    }
  }

}
