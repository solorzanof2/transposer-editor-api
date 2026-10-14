import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { HarmonicTemplateDTO } from '../contracts/datatransfers/HarmonicTemplateDTO';
import { toHarmonicTemplateResponseDTO } from '../contracts/responses/HarmonicTemplateResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { HarmonicTemplateService } from '../services/HarmonicTemplateService';


export class CreateHarmonicTemplateUseCase implements UseCase {

  private harmonicTemplateService: HarmonicTemplateService = new HarmonicTemplateService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const { userId, payload } = options;
      const template = await this.harmonicTemplateService.create(userId, payload) as HarmonicTemplateDTO;

      return useResolve(toHarmonicTemplateResponseDTO(template) as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'CreateHarmonicTemplateUseCase', options.requestId);
      return useReject(error);
    }
  }

}

