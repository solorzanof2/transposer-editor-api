import { CloneHarmonicTemplateRequestDTO } from '../../../core/contracts/datatransfers/HarmonicTemplateDTO';
import { HarmonicTemplateResponseDTO } from '../../../core/contracts/responses/HarmonicTemplateResponseDTO';
import { CloneHarmonicTemplateUseCase } from '../../../core/usecases/CloneHarmonicTemplateUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const CloneHarmonicTemplate: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const templateId = event.pathParameters?.templateId;
    const payload = (event.body || {}) as CloneHarmonicTemplateRequestDTO;

    if (!templateId) {
      SimpleLogger.warning(`No se recibio un templateId valido: ${templateId}`, 'CloneHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.name !== undefined && !payload.name) {
      SimpleLogger.warning(`El nombre de la plantilla clonada es invalido: ${payload.name}`, 'CloneHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
      SimpleLogger.warning('Los tags de la plantilla clonada son invalidos.', 'CloneHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const cloneHarmonicTemplateUseCase = new CloneHarmonicTemplateUseCase();

    try {
      const template = await cloneHarmonicTemplateUseCase.execute<HarmonicTemplateResponseDTO>({
        userId,
        templateId,
        payload,
        requestId: event.requestId,
      });

      return ResponseEntity.created(template);
    }
    catch (error: any) {
      if (error.message === CloneHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}


export const CloneHarmonicTemplateHandler = Middlify(CloneHarmonicTemplate, [
  ProvideLoggerMiddleware('CloneHarmonicTemplateHandler'),
  ProvidePolicyMiddleware(['user']),
]);
