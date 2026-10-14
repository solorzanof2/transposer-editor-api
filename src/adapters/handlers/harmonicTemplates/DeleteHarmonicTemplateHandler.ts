import { DeleteHarmonicTemplateUseCase } from '../../../core/usecases/DeleteHarmonicTemplateUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const DeleteHarmonicTemplate: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const templateId = event.pathParameters?.templateId;

    if (!templateId) {
      SimpleLogger.warning(`No se recibio un templateId valido: ${templateId}`, 'DeleteHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const deleteHarmonicTemplateUseCase = new DeleteHarmonicTemplateUseCase();

    try {
      await deleteHarmonicTemplateUseCase.execute<boolean>({
        userId,
        templateId,
        requestId: event.requestId,
      });

      return ResponseEntity.noContent();
    }
    catch (error: any) {
      if (error.message === DeleteHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const DeleteHarmonicTemplateHandler = Middlify(DeleteHarmonicTemplate, [
  ProvideLoggerMiddleware('DeleteHarmonicTemplateHandler'),
  ProvidePolicyMiddleware(),
]);
