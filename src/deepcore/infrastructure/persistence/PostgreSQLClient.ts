import * as pg from 'pg';
import { DatabaseClient, DatabaseConfiguration } from './interfaces/DatabaseClient';
import { QueryBuilder } from './interfaces/QueryBuilder';

export class PostgreSQLClient implements DatabaseClient {
  static instance: PostgreSQLClient;

  private pool: pg.Pool;
  private loggingSQL = false;

  constructor(options: DatabaseConfiguration) {
    this.pool = new pg.Pool({
      host: options.host,
      user: options.user,
      password: options.password,
      database: options.name,
      port: options.port,
    });
    this.loggingSQL = options.logginSQL;
  }

  static getInstance(options?: DatabaseConfiguration): PostgreSQLClient {
    if (PostgreSQLClient.instance || !options) {
      return PostgreSQLClient.instance;
    }

    PostgreSQLClient.instance = new PostgreSQLClient(options);

    return PostgreSQLClient.instance;
  }

  async prepare(builder: QueryBuilder): Promise<any[] | any> {
    try {
      const sql = builder.build();

      if (this.loggingSQL) {
        console.log(sql.query);
      }

      if (sql.parameters.length) {
        return this.execute(sql.query, sql.parameters);
      }

      return this.plainExecute(sql.query);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async plainExecute(query: string, isExternal: boolean = false): Promise<any[] | any> {
    const client = await this.pool.connect();
    try {
      if (isExternal && this.loggingSQL) {
        console.log(query);
      }

      const result = await client.query(query);
      return this.normalizeQueryResult(query, result);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      client.release();
    }
  }

  async execute(query: string, values: any[], isExternal: boolean = false): Promise<any[] | any> {
    const client = await this.pool.connect();
    try {
      if (isExternal && this.loggingSQL) {
        console.log(query);
      }

      const result = await client.query(query, values);
      return this.normalizeQueryResult(query, result);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      client.release();
    }
  }

  private normalizeQueryResult(query: string, result: any): any[] | any {
    const trimmed = query.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) {
      return result.rows;
    }

    return result;
  }
}