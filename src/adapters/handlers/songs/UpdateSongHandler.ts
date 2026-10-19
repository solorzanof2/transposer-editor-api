import { UpdateSongRequestDTO } from '../../../core/contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { UpdateSongUseCase } from '../../../core/usecases/UpdateSongUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const EnharmonicPreferences = ['sharp', 'flat', 'auto'];

const UpdateSong: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const songId = event.pathParameters?.songId;
    const payload = event.body as UpdateSongRequestDTO;

    if (!songId) {
      SimpleLogger.warning('No se recibio songId para actualizar cancion.', 'UpdateSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (!payload?.title || !payload?.source) {
      SimpleLogger.warning(`El titulo o el contenido de la cancion son invalidos. Titulo: ${payload?.title} | Source: ${payload?.source}`, 'UpdateSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.enharmonicPreference && !EnharmonicPreferences.includes(payload.enharmonicPreference)) {
      SimpleLogger.warning(`La preferencia enarmónica no es valida. ${payload.enharmonicPreference}`, 'UpdateSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const updateSongUseCase = new UpdateSongUseCase();

    try {
      const song = await updateSongUseCase.execute<SongResponseDTO>({
        userId,
        songId,
        payload,
        requestId: event.requestId,
      });

      return ResponseEntity.ok(song);
    }
    catch (error: any) {
      if (error.message === UpdateSongUseCase.Error.SongNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const UpdateSongHandler = Middlify(UpdateSong, [
  ProvideLoggerMiddleware('UpdateSongHandler'),
  ProvidePolicyMiddleware(['user']),
]);
