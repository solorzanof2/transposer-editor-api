import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SongDTO } from '../contracts/datatransfers/SongDTO';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class ListSongsUseCase implements UseCase {

  static readonly Error = {
    MissingUserId: 'MissingUserId',
  };

  private songService: SongService = new SongService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        userId,
        requestId,
      } = options;

      if (!userId) {
        SimpleLogger.warning('No se recibio userId para listar canciones.', 'ListSongsUseCase', requestId);
        return useReject(new Error(ListSongsUseCase.Error.MissingUserId));
      }

      const songs = await this.songService.listByUser(userId) as SongDTO[];

      return useResolve(songs);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'ListSongsUseCase', options.requestId);
      return useReject(error);
    }
  }

}
