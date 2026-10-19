import { CreateHarmonicTemplateRequestDTO } from '../../../core/contracts/datatransfers/HarmonicTemplateDTO';
import { HarmonicTemplateSection } from '../../../core/domain/HarmonicTemplate';
import { HarmonicTemplateResponseDTO } from '../../../core/contracts/responses/HarmonicTemplateResponseDTO';
import { CreateHarmonicTemplateUseCase } from '../../../core/usecases/CreateHarmonicTemplateUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { ProvidePolicyMiddleware } from '../../../deepcore/application/middlify/middleware/PolicyMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


const TemplateModes = ['major', 'minor'];

const CreateHarmonicTemplate: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const userId = event.principalUser?._id?.toString();
    const payload = event.body as CreateHarmonicTemplateRequestDTO;

    if (!payload?.name || !payload?.mode || !TemplateModes.includes(payload.mode) || !isValidSections(payload.sections)) {
      SimpleLogger.warning('El payload para crear la plantilla armonica es invalido.', 'CreateHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
      SimpleLogger.warning('Los tags de la plantilla armonica son invalidos.', 'CreateHarmonicTemplateHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const createHarmonicTemplateUseCase = new CreateHarmonicTemplateUseCase();
    const template = await createHarmonicTemplateUseCase.execute<HarmonicTemplateResponseDTO>({
      userId,
      payload,
      requestId: event.requestId,
    });

    return ResponseEntity.created(template);
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


export const CreateHarmonicTemplateHandler = Middlify(CreateHarmonicTemplate, [
  ProvideLoggerMiddleware('CreateHarmonicTemplateHandler'),
  ProvidePolicyMiddleware(['user']),
]);
