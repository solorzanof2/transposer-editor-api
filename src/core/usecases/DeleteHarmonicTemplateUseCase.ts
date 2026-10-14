import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { HarmonicTemplateService } from '../services/HarmonicTemplateService';


export class DeleteHarmonicTemplateUseCase implements UseCase {

  static readonly Error = {
    HarmonicTemplateNotFound: 'HarmonicTemplateNotFound',
  };

  private harmonicTemplateService: HarmonicTemplateService = new HarmonicTemplateService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const { userId, templateId, requestId } = options;
      const deleted = await this.harmonicTemplateService.delete(userId, templateId) as boolean;

      if (!deleted) {
        SimpleLogger.warning(`No se encontro la plantilla armonica ${templateId}.`, 'DeleteHarmonicTemplateUseCase', requestId);
        return useReject(new Error(DeleteHarmonicTemplateUseCase.Error.HarmonicTemplateNotFound));
      }

      return useResolve(true as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'DeleteHarmonicTemplateUseCase', options.requestId);
      return useReject(error);
    }
  }

}
