import { CreateSongRequestDTO } from '../../../core/contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { CreateSongUseCase } from '../../../core/usecases/CreateSongUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const EnharmonicPreferences = ['sharp', 'flat', 'auto'];

const CreateSong: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const payload = event.body as CreateSongRequestDTO;

    if (!payload?.title || !payload?.source) {
      SimpleLogger.warning(`El titulo o el contenido de la cancion son invalidos. Titulo: ${payload?.title} | Source: ${payload?.source}`, 'CreateSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.enharmonicPreference && !EnharmonicPreferences.includes(payload.enharmonicPreference)) {
      SimpleLogger.warning(`La preferencia enarmónica no es valida. ${payload.enharmonicPreference}`, 'CreateSongHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const createSongUseCase = new CreateSongUseCase();

    const song = await createSongUseCase.execute<SongResponseDTO>({
      userId,
      payload,
    });

    return ResponseEntity.created(song);
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const CreateSongHandler = Middlify(CreateSong, [
  ProvideLoggerMiddleware('CreateSongHandler'),
  ProvidePolicyMiddleware(),
]);

