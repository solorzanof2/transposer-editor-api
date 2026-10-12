// import { DatabaseFactory, DatabaseOptions } from '../../infrastructure/persistence/DatabaseFactory';
import { DatabaseFactory, DatabaseType } from '../../infrastructure/persistence/DatabaseFactory';
import { MigrationManager } from '../../infrastructure/persistence/MigrationManager';
import { DatabaseConfiguration } from '../../infrastructure/persistence/interfaces/DatabaseClient';
import { DatabaseContext } from '../../infrastructure/persistence/DatabaseContext';
import { BootContext } from '../Context';
import * as path from 'path';


/** Redis, DB, etc */
export async function boot(context: BootContext): Promise<void> {

  const environment: any = context.get('env');

  const dbType = (environment.APP_DB_TYPE || 'mysql').toLowerCase() as DatabaseType;

  console.log(`[INF0] INFRA.BOOT > Inicializando Base de datos ${dbType}.`);

  let configuration: DatabaseConfiguration = {} as DatabaseConfiguration;

  if (dbType === DatabaseType.POSTGRESQL) {
    configuration = {
      host: environment.POSTGRESQL_HOST || environment.DB_HOST || 'localhost',
      port: environment.POSTGRESQL_PORT || environment.DB_PORT || 5432,
      user: environment.POSTGRESQL_USER || environment.DB_USER || 'postgres',
      password: environment.POSTGRESQL_PASSWORD || environment.DB_PASSWORD || '',
      name: environment.POSTGRESQL_DATABASE || environment.DB_NAME || 'postgres',
      logginSQL: environment.POSTGRESQL_LOGGIN_SQL || environment.DB_LOGGIN_SQL || false,
    };
  }

  if (dbType === DatabaseType.MYSQL) {
    configuration = {
      host: environment.MYSQL_HOST || environment.DB_HOST || 'localhost',
      port: environment.MYSQL_PORT || environment.DB_PORT || 3306,
      user: environment.MYSQL_USER || environment.DB_USER || 'root',
      password: environment.MYSQL_PASSWORD || environment.DB_PASSWORD || '',
      name: environment.MYSQL_DATABASE || environment.DB_NAME || 'test',
      logginSQL: environment.MYSQL_LOGGIN_SQL || environment.DB_LOGGIN_SQL || false,
    };
  }

  if (dbType === DatabaseType.MONGODB) {
    configuration = {
      host: environment.MONGODB_URI || environment.MONGODB_HOST || 'localhost',
      port: environment.MONGODB_PORT || 27017,
      name: environment.MONGODB_DATABASE || '',
      user: environment.MONGODB_USER || '',
      password: environment.MONGODB_PASSWORD || '',
      logginSQL: false,
    };
  }

  const client = DatabaseFactory.createClient(dbType, configuration);

  // Inicializar DatabaseContext
  DatabaseContext.getInstance().setDatabase(client, dbType);

  // Guardar en contexto para uso posterior
  context.set('database', client);
  context.set('databaseType', dbType);

  // ejecutar MIGRACIONES;
  const migrationsPath = path.join(path.resolve('.'), 'migrations');

  try {
    await MigrationManager
      .getInstance(migrationsPath, dbType)
      .initialize();
  }
  catch (error) {
    console.log(`[ERR0] INFRA.BOOT > FallÃ³ la ejecuciÃ³n de la MigraciÃ³n. ${error.message}`);
  }

  // inicializar REDIS;

  return Promise.resolve();
}


