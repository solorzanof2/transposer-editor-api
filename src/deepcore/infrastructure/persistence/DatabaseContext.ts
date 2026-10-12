import { DatabaseClient } from './interfaces/DatabaseClient';
import { DatabaseType } from './DatabaseFactory';

export class DatabaseContext {
  private static instance: DatabaseContext;
  private database: DatabaseClient | null = null;
  private databaseType: DatabaseType | null = null;

  private constructor() {}

  static getInstance(): DatabaseContext {
    if (!DatabaseContext.instance) {
      DatabaseContext.instance = new DatabaseContext();
    }
    return DatabaseContext.instance;
  }

  setDatabase(database: DatabaseClient, databaseType: DatabaseType): void {
    this.database = database;
    this.databaseType = databaseType;
  }

  getDatabase(): DatabaseClient {
    if (!this.database) {
      throw new Error('Database not initialized. Call setDatabase first.');
    }
    return this.database;
  }

  getDatabaseType(): DatabaseType {
    if (!this.databaseType) {
      throw new Error('Database type not initialized. Call setDatabase first.');
    }
    return this.databaseType;
  }
}