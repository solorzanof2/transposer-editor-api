import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SongDTO } from '../contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../contracts/responses/SongResponseDTO';
import { toSongResponseDTO } from '../contracts/responses/SongResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { SongService } from '../services/SongService';


export class CreateSongUseCase implements UseCase {

  static readonly Error = {
    InvalidSongPayload: 'InvalidSongPayload',
  };

  private songService: SongService = new SongService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        userId,
        payload,
      } = options;

      const song = await this.songService.create(userId, payload) as SongDTO;
      const response = toSongResponseDTO(song) as SongResponseDTO;

      return useResolve(response as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'CreateSongUseCase', options.requestId);
      return useReject(error);
    }
  }

}
