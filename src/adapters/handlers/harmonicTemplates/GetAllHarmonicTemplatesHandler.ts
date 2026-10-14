import { HarmonicTemplateResponseDTO } from '../../../core/contracts/responses/HarmonicTemplateResponseDTO';
import { ListHarmonicTemplatesUseCase } from '../../../core/usecases/ListHarmonicTemplatesUseCase';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const GetHarmonicTemplates: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const listHarmonicTemplatesUseCase = new ListHarmonicTemplatesUseCase();

    const collection = await listHarmonicTemplatesUseCase.execute<HarmonicTemplateResponseDTO[]>({
      userId,
      requestId: event.requestId,
    });

    if (!collection?.length) {
      return ResponseEntity.ok(new Array<HarmonicTemplateResponseDTO>());
    }

    return ResponseEntity.ok(collection);
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const GetHarmonicTemplatesHandler = Middlify(GetHarmonicTemplates, [
  ProvideLoggerMiddleware('GetHarmonicTemplatesHandler'),
  ProvidePolicyMiddleware(),
]);
