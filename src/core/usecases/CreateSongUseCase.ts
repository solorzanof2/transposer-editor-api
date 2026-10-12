import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { CreateSongRequestDTO, SongDTO } from '../contracts/datatransfers/SongDTO';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class CreateSongUseCase implements UseCase {

  static readonly Error = {
    MissingUserId: 'MissingUserId',
    InvalidSongPayload: 'InvalidSongPayload',
  };

  private songService: SongService = new SongService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        userId,
        payload,
        requestId,
      } = options;

      if (!userId) {
        SimpleLogger.warning('No se recibio userId para crear cancion.', 'CreateSongUseCase', requestId);
        return useReject(new Error(CreateSongUseCase.Error.MissingUserId));
      }

      if (!this.isValidPayload(payload)) {
        SimpleLogger.warning('El payload de cancion es invalido.', 'CreateSongUseCase', requestId);
        return useReject(new Error(CreateSongUseCase.Error.InvalidSongPayload));
      }

      const song = await this.songService.create(userId, payload) as SongDTO;

      return useResolve(song);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'CreateSongUseCase', options.requestId);
      return useReject(error);
    }
  }

  private isValidPayload(payload: CreateSongRequestDTO): boolean {
    return !!payload?.title && !!payload?.source;
  }

}
