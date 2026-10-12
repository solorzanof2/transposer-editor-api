import { SongResponseDTO } from '../../../core/contracts/responses/SongResponseDTO';
import { ListSongsUseCase } from '../../../core/usecases/ListSongsUseCase';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const GetSongs: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();

    if (!userId) {
      return ResponseEntity.forbidden();
    }

    const listSongsUseCase = new ListSongsUseCase();

    try {
      const collection = await listSongsUseCase.execute<SongResponseDTO[]>({
        userId,
        requestId: event.requestId,
      });

      if (!collection?.length) {
        return ResponseEntity.ok(new Array<SongResponseDTO>());
      }

      return ResponseEntity.ok(collection);
    }
    catch (error: any) {
      if (error.message === ListSongsUseCase.Error.MissingUserId) {
        return ResponseEntity.forbidden();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const GetSongsHandler = Middlify(GetSongs, [
  ProvideLoggerMiddleware('GetSongsHandler'),
  ProvidePolicyMiddleware(),
]);
