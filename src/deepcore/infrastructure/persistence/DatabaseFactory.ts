import { DatabaseClient, DatabaseConfiguration } from './interfaces/DatabaseClient';
import { MongoDBClient } from './MongoDBClient';
import { MySQLClient } from './MySQLClient';
import { PostgreSQLClient } from './PostgreSQLClient';

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
}

export class DatabaseFactory {
  static createClient(type: DatabaseType, options: DatabaseConfiguration): DatabaseClient {
    switch (type) {
      case DatabaseType.MYSQL:
        return MySQLClient.getInstance(options);
      case DatabaseType.POSTGRESQL:
        return PostgreSQLClient.getInstance(options);
      case DatabaseType.MONGODB:
        return MongoDBClient.getInstance(options);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}