import { WorkerHandler } from '../../../adapters/handlers/WorkerHandler';
import { BootContext } from '../Context';


export async function boot(context: BootContext): Promise<void> {

  console.log(`[INF0] WORKER.BOOT > Inicializando Worker Handler.`);

  const environment: any = context.get('env');

  await WorkerHandler(environment);

  return Promise.resolve();
}

