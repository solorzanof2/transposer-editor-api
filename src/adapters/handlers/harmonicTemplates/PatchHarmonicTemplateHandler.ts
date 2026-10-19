import { PatchHarmonicTemplateRequestDTO } from '../../../core/contracts/datatransfers/HarmonicTemplateDTO';
import { HarmonicTemplateSection } from '../../../core/domain/HarmonicTemplate';
import { HarmonicTemplateResponseDTO } from '../../../core/contracts/responses/HarmonicTemplateResponseDTO';
import { PatchHarmonicTemplateUseCase } from '../../../core/usecases/PatchHarmonicTemplateUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const TemplateModes = ['major', 'minor'];

const PatchHarmonicTemplate: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const templateId = event.pathParameters?.templateId;
    const payload = event.body as PatchHarmonicTemplateRequestDTO;

    if (!templateId) {
      SimpleLogger.warning(`No se recibio un templateId valido: ${templateId}`, 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (!payload || !Object.keys(payload).length) {
      SimpleLogger.warning('No se recibieron datos para editar la plantilla armonica.', 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.name !== undefined && !payload.name) {
      SimpleLogger.warning(`El nombre de la plantilla armonica es invalido: ${payload.name}`, 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.mode !== undefined && !TemplateModes.includes(payload.mode)) {
      SimpleLogger.warning(`El modo de la plantilla armonica es invalido: ${payload.mode}`, 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
      SimpleLogger.warning('Los tags de la plantilla armonica son invalidos.', 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.sections !== undefined && !isValidSections(payload.sections)) {
      SimpleLogger.warning('Las secciones de la plantilla armonica son invalidas.', 'PatchHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const patchHarmonicTemplateUseCase = new PatchHarmonicTemplateUseCase();

    try {
      const template = await patchHarmonicTemplateUseCase.execute<HarmonicTemplateResponseDTO>({
        userId,
        templateId,
        payload,
        requestId: event.requestId,
      });

      return ResponseEntity.ok(template);
    }
    catch (error: any) {
      if (error.message === PatchHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound) {
        return ResponseEntity.notFound();
      }

      throw new Error(error.message);
    }
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}

const isValidSections = (sections: HarmonicTemplateSection[]): boolean => {
  if (!Array.isArray(sections) || !sections.length) {
    return false;
  }

  return sections.every((section) => (
    !!section?.name &&
    Array.isArray(section.degrees) &&
    section.degrees.length > 0 &&
    section.degrees.every((degree) => !!degree && typeof degree === 'string') &&
    typeof section.order === 'number'
  ));
}


export const PatchHarmonicTemplateHandler = Middlify(PatchHarmonicTemplate, [
  ProvideLoggerMiddleware('PatchHarmonicTemplateHandler'),
  ProvidePolicyMiddleware(['user']),
]);
