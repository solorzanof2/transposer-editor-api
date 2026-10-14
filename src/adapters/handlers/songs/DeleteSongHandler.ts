import { DeleteSongUseCase } from '../../../core/usecases/DeleteSongUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const DeleteSong: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const songId = event.pathParameters?.songId;

    if (!songId) {
      SimpleLogger.warning(`No se recibio un SongID valido: ${songId}`, 'DeleteSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const deleteSongUseCase = new DeleteSongUseCase();

    try {
      await deleteSongUseCase.execute<boolean>({
        userId,
        songId,
        requestId: event.requestId,
      });

      return ResponseEntity.noContent();
    }
    catch (error: any) {
      if (error.message === DeleteSongUseCase.Error.SongNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const DeleteSongHandler = Middlify(DeleteSong, [
  ProvideLoggerMiddleware('DeleteSongHandler'),
  ProvidePolicyMiddleware(),
]);
