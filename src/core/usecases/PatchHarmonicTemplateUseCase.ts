import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { HarmonicTemplateDTO } from '../contracts/datatransfers/HarmonicTemplateDTO';
import { toHarmonicTemplateResponseDTO } from '../contracts/responses/HarmonicTemplateResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { HarmonicTemplateService } from '../services/HarmonicTemplateService';


export class PatchHarmonicTemplateUseCase implements UseCase {

  static readonly Error = {
    HarmonicTemplateNotFound: 'HarmonicTemplateNotFound',
  };

  private harmonicTemplateService: HarmonicTemplateService = new HarmonicTemplateService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const { userId, templateId, payload, requestId } = options;
      const template = await this.harmonicTemplateService.patch(userId, templateId, payload) as HarmonicTemplateDTO | null;

      if (!template?.id) {
        SimpleLogger.warning(`No se encontro la plantilla armonica ${templateId}.`, 'PatchHarmonicTemplateUseCase', requestId);
        return useReject(new Error(PatchHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound));
      }

      return useResolve(toHarmonicTemplateResponseDTO(template) as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'PatchHarmonicTemplateUseCase', options.requestId);
      return useReject(error);
    }
  }

}

