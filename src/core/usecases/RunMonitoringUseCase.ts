import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { useResolve } from '../helpers/functions/Promises';


export class RunMonitoringUseCase implements UseCase {

  async execute<T>(_options: UseCaseOptions): Promise<T> {
    SimpleLogger.warning('RunMonitoringUseCase no tiene una implementacion configurada para esta API.', 'RunMonitoringUseCase');
    return useResolve(null as T);
  }

}
