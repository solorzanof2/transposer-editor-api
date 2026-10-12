import { MigrationKernel } from './core/MigrationKernel';
import { DatabaseType } from './DatabaseFactory';


export class MigrationManager {

  private kernel: MigrationKernel;

  constructor(migrationRoute: string, databaseType: DatabaseType = DatabaseType.MYSQL) {
    this.kernel = new MigrationKernel(migrationRoute, databaseType);
  }

  static getInstance(route: string, databaseType: DatabaseType = DatabaseType.MYSQL): MigrationManager {
    return new MigrationManager(route, databaseType);
  }

  async initialize(): Promise<void> {
    try {
      await this.kernel.initialize();
      await this.kernel.start();
    }
    catch (error: any) {
      return Promise.reject(new Error(error.message));
    }
  }

}