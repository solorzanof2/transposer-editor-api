import { RedisClient } from '../../infrastructure/redis/RedisClient';
import { BootContext } from '../Context';


/** Dominio de negocio */
export async function boot(context: BootContext): Promise<void> {

  console.log(`[INF0] SERVICES.BOOT > Inicializando Services.`);

  const environment: any = context.get('env');

  const redis = RedisClient.createInstance(
    environment.REDIS_HOST,
    +environment.REDIS_PORT,
  );

  await redis.initialize();

  return Promise.resolve();
}

