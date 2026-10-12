import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';


export const WorkerHandler = async (_environment: any): Promise<void> => {
  SimpleLogger.info(`Se ha iniciado el worker.`, 'WorkerHandler');
  // if (String(environment.TRACKER_ENABLED).toLowerCase() !== 'true') {
  //   SimpleLogger.info('El worker se encuentra deshabilitado.', 'WorkerHandler');
  //   return;
  // }
  // const interval = Math.max(1, Number(environment.TRACKER_DEFAULT_FREQUENCY_MINUTES || 15)) * 60000;
  // const run = async (): Promise<void> => {
  //   try {
  //     await new RunMonitoringUseCase().execute({ force: false });
  //   }
  //   catch (error) {
  //     SimpleLogger.error(`Falló la ejecución: ${error instanceof Error ? error.message : error}`, 'WorkerHandler');
  //   }
  // };
  // await run();
  // const timer = setInterval(run, interval);
  // timer.unref();
  // SimpleLogger.info(`Worker inicializado con un intervalo de ${interval / 60000} minutos.`, 'WorkerHandler');
}
