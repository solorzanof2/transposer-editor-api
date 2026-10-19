import { HarmonicTemplateResponseDTO } from '../../../core/contracts/responses/HarmonicTemplateResponseDTO';
import { GetHarmonicTemplateUseCase } from '../../../core/usecases/GetHarmonicTemplateUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const GetHarmonicTemplate: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const templateId = event.pathParameters?.templateId;

    if (!templateId) {
      SimpleLogger.warning(`No se recibio un templateId valido: ${templateId}`, 'GetHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const getHarmonicTemplateUseCase = new GetHarmonicTemplateUseCase();

    try {
      const template = await getHarmonicTemplateUseCase.execute<HarmonicTemplateResponseDTO>({
        userId,
        templateId,
        requestId: event.requestId,
      });

      return ResponseEntity.ok(template);
    }
    catch (error: any) {
      if (error.message === GetHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const GetHarmonicTemplateHandler = Middlify(GetHarmonicTemplate, [
  ProvideLoggerMiddleware('GetHarmonicTemplateHandler'),
  ProvidePolicyMiddleware(['user']),
]);
