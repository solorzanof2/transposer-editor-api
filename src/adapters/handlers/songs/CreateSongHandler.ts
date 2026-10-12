import { CreateSongRequestDTO } from '../../../core/contracts/datatransfers/SongDTO';
import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { CreateSongUseCase } from '../../../core/usecases/CreateSongUseCase';
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

    if (!userId) {
      return ResponseEntity.forbidden();
    }

    if (!payload?.title || !payload?.source) {
      return ResponseEntity.badRequest();
    }

    if (payload.enharmonicPreference && !EnharmonicPreferences.includes(payload.enharmonicPreference)) {
      return ResponseEntity.badRequest();
    }

    const createSongUseCase = new CreateSongUseCase();

    try {
      const song = await createSongUseCase.execute<SongResponseDTO>({
        userId,
        payload,
        requestId: event.requestId,
      });

      return ResponseEntity.created(song);
    }
    catch (error: any) {
      if (error.message === CreateSongUseCase.Error.MissingUserId) {
        return ResponseEntity.forbidden();
      }

      if (error.message === CreateSongUseCase.Error.InvalidSongPayload) {
        return ResponseEntity.badRequest();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const CreateSongHandler = Middlify(CreateSong, [
  ProvideLoggerMiddleware('CreateSongHandler'),
  ProvidePolicyMiddleware(),
]);
