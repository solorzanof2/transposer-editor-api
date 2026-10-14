import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { HarmonicTemplateDTO } from '../contracts/datatransfers/HarmonicTemplateDTO';
import { HarmonicTemplateResponseDTO } from '../contracts/responses/HarmonicTemplateResponseDTO';
import { toHarmonicTemplateResponseDTO } from '../contracts/responses/HarmonicTemplateResponseMapper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { HarmonicTemplateService } from '../services/HarmonicTemplateService';


export class ListHarmonicTemplatesUseCase implements UseCase {

  private harmonicTemplateService: HarmonicTemplateService = new HarmonicTemplateService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const { userId } = options;
      const templates = await this.harmonicTemplateService.listByUser(userId) as HarmonicTemplateDTO[];
      const collection = templates.map((template) => toHarmonicTemplateResponseDTO(template)) as HarmonicTemplateResponseDTO[];

      return useResolve(collection as T);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'ListHarmonicTemplatesUseCase', options.requestId);
      return useReject(error);
    }
  }

}
