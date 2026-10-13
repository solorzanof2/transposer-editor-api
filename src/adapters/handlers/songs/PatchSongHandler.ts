import { PatchSongRequestDTO } from '../../../core/contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { PatchSongUseCase } from '../../../core/usecases/PatchSongUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const EnharmonicPreferences = ['sharp', 'flat', 'auto'];

const PatchSong: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const songId = event.pathParameters?.songId;
    const payload = event.body as PatchSongRequestDTO;

    if (!songId) {
      SimpleLogger.warning(`No se recibio un SongID valido: ${songId}`, 'PatchSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (!payload || !Object.keys(payload).length) {
      SimpleLogger.warning('No se recibieron datos para editar la cancion.', 'PatchSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.title !== undefined && !payload.title) {
      SimpleLogger.warning(`El titulo de la cancion es invalido: ${payload.title}`, 'PatchSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.source !== undefined && !payload.source) {
      SimpleLogger.warning(`El contenido de la cancion es invalido: ${payload.source}`, 'PatchSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.enharmonicPreference && !EnharmonicPreferences.includes(payload.enharmonicPreference)) {
      SimpleLogger.warning(`La preferencia enarmónica no es valida. ${payload.enharmonicPreference}`, 'PatchSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const patchSongUseCase = new PatchSongUseCase();

    try {
      const song = await patchSongUseCase.execute<SongResponseDTO>({
        userId,
        songId,
        payload,
        requestId: event.requestId,
      });

      return ResponseEntity.ok(song);
    }
    catch (error: any) {
      if (error.message === PatchSongUseCase.Error.SongNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const PatchSongHandler = Middlify(PatchSong, [
  ProvideLoggerMiddleware('PatchSongHandler'),
  ProvidePolicyMiddleware(),
]);
