import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { GetSongUseCase } from '../../../core/usecases/GetSongUseCase';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const GetSong: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const songId = event.pathParameters?.songId;

    if (!userId) {
      return ResponseEntity.forbidden();
    }

    if (!songId) {
      return ResponseEntity.badRequest();
    }

    const getSongUseCase = new GetSongUseCase();

    try {
      const song = await getSongUseCase.execute<SongResponseDTO>({
        userId,
        songId,
        requestId: event.requestId,
      });

      return ResponseEntity.ok(song);
    }
    catch (error: any) {
      if (error.message === GetSongUseCase.Error.MissingUserId) {
        return ResponseEntity.forbidden();
      }

      if (error.message === GetSongUseCase.Error.MissingSongId) {
        return ResponseEntity.badRequest();
      }

      if (error.message === GetSongUseCase.Error.SongNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const GetSongHandler = Middlify(GetSong, [
  ProvideLoggerMiddleware('GetSongHandler'),
  ProvidePolicyMiddleware(),
]);
