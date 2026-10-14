import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { HarmonicTemplateDTO } from '../contracts/datatransfers/HarmonicTemplateDTO';
import { toHarmonicTemplateResponseDTO } from '../contracts/responses/HarmonicTemplateResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { HarmonicTemplateService } from '../services/HarmonicTemplateService';


export class GetHarmonicTemplateUseCase implements UseCase {

  static readonly Error = {
    HarmonicTemplateNotFound: 'HarmonicTemplateNotFound',
  };

  private harmonicTemplateService: HarmonicTemplateService = new HarmonicTemplateService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const { userId, templateId, requestId } = options;
      const template = await this.harmonicTemplateService.getById(userId, templateId) as HarmonicTemplateDTO | null;

      if (!template?.id) {
        SimpleLogger.warning(`No se encontro la plantilla armonica ${templateId}.`, 'GetHarmonicTemplateUseCase', requestId);
        return useReject(new Error(GetHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound));
      }

      return useResolve(toHarmonicTemplateResponseDTO(template) as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'GetHarmonicTemplateUseCase', options.requestId);
      return useReject(error);
    }
  }

}

