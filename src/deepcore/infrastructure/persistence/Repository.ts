import { QueryManager } from './core/QueryManager';
import { ColumnType, FetchType, JoinType } from './interfaces/JoinMappers';
import { Model } from './models/Model';
import { DatabaseType } from './DatabaseFactory';


export class Repository<T extends Model> extends QueryManager<T> {

  get tablename(): string {
    return this.model.tablename;
  }

  get queryTablename(): string {
    const quote = this.databaseType === DatabaseType.POSTGRESQL ? '"' : '`';
    return `${quote}${this.tablename}${quote}`;
  }

  constructor(model: any) {
    super(model);
  }

  async findById(value: number): Promise<T> {
    try {
      this.selectQuery
        .safeAnd()
        .equals(QueryManager.ColumnID, `${value}`);

      const results = await this.query<T>(this.selectQuery);

      const [model] = this.dataMapper(results);

      return Promise.resolve(model);
    }
    catch (error) {
      return Promise.reject(error);
    }
    finally {
      this.resetQuery();
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const results = await this.query<T>(this.selectQuery);
      return Promise.resolve(this.dataMapper(results));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async count(): Promise<number> {
    try {
      const quote = this.databaseType === DatabaseType.POSTGRESQL ? '"' : '`';
      const query = [
        `SELECT COUNT(${quote}t0${quote}.id) AS total`,
        "FROM",
        `${quote}${this.tablename}${quote}`,
        `${quote}t0${quote}`
      ].join(' ');

      const [totalRows] = await this.queryBySql<any>(query);

      if (!totalRows?.total) {
        return Promise.resolve(0);
      }

      return Promise.resolve(totalRows.total);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async save(model: T, getLastInserted: boolean = false): Promise<T> {
    try {
      let result = {} as StatementResult;

      // is update
      if (model.id) {
        const query = this.update();

        for (const field of this.fieldsCollection) {
          if (field === QueryManager.ColumnID) {
            continue;
          }

          query.set(field, `${model[field as keyof Model]}`);
        }

        query.equals(QueryManager.ColumnID, `${model.id}`);

        result = await this.database.prepare(query) as StatementResult;

        if ((this.databaseType === DatabaseType.MYSQL && !(result as MySQLResult).affectedRows)
          ||(this.databaseType === DatabaseType.POSTGRESQL && !(result as PostgreSQLResult).rowCount)
        ) {
          throw new Error(`Something went wrong when try to update register with id: ${model.id}.`);
        }

        if (!getLastInserted) {
          return Promise.resolve({} as T);
        }

        return Promise.resolve(await this.findById(model.id));
      }

      // is save
      const insert = this.insert();

      const collection = new Array<string>();
      const values = new Array<string>();

      let value;
      for (const field of this.fieldsCollection) {
        value = model[field as keyof Model];
        if (!value) {
          continue;
        }

        collection.push(field);
        values.push(value.toString());
      }

      insert.fields(collection);
      insert.values(values);
      insert.setGetLastInserted();

      result = await this.database.prepare(insert) as StatementResult;

      if ((this.databaseType === DatabaseType.MYSQL && !(result as MySQLResult).affectedRows)
        ||(this.databaseType === DatabaseType.POSTGRESQL && !(result as PostgreSQLResult).rowCount)
      ) {
        throw new Error(`Something went wrong when try to insert the data.`);
      }

      if (!getLastInserted) {
        return Promise.resolve({} as T);
      }

      if (this.databaseType === DatabaseType.MYSQL) {
        const lastInserted = await this.findById((result as MySQLResult).insertId);

        lastInserted.id = (result as MySQLResult).insertId;

        return Promise.resolve(lastInserted);
      }

      return Promise.resolve((result as PostgreSQLResult).rows[0] as T);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteById(value: number): Promise<void> {
    try {
      const query = this.delete()
        .equals(QueryManager.ColumnID, `${value}`);

      const result = await this.database.prepare(query);
      if (!result.affectedRows) {
        throw new Error(`Something went wrong when try to delete the register with id ${value}.`);
      }

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  protected mapFieldLike(value: string): string {
    if (this.databaseType === DatabaseType.POSTGRESQL) {
      return `LOWER(${value}) LIKE '%' || ? || '%'`;
    }
    return `LOWER(${value}) LIKE CONCAT('%', ?, '%')`;
  }

  protected extract(value: string): any {
    return JSON.parse(value);
  }

  protected async countByQuery(value: string, parameters?: string[]): Promise<number> {
    try {
      const [totalRows] = await this.queryBySql<any>(value, parameters);

      if (!totalRows?.total) {
        return Promise.resolve(0);
      }

      return Promise.resolve(totalRows.total);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

}

interface StatementResult { }

interface MySQLResult extends StatementResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}
// {
//   "fieldCount": 0,
//   "affectedRows": 1,
//   "insertId": 4,
//   "serverStatus": 2,
//   "warningCount": 0,
//   "message": "",
//   "protocol41": true,
//   "changedRows": 0
// }

// {
//   "fieldCount": 0,
//   "affectedRows": 1,
//   "insertId": 0,
//   "serverStatus": 2,
//   "warningCount": 0,
//   "message": "(Rows matched: 1  Changed: 1  Warnings: 0",
//   "protocol41": true,
//   "changedRows": 1
// }

interface PostgreSQLResult extends StatementResult {
  command: string,
  rowCount: number,
  oid: number,
  rows: any[],
  fields: any[],
  _parsers: any,
  _types: any,
  RowCtor: any,
  rowAsArray: boolean,
  _prebuiltEmptyResultObject: any,
}

// POSTGRESQL
// {
//   command: "INSERT",
//   rowCount: 1,
//   oid: 0,
//   rows: [],
//   fields: [],
//  _parsers: undefined,
//  _types: any,
//   RowCtor: null,
//   rowAsArray: false,
//   _prebuiltEmptyResultObject: null,
// }

export interface JoinOptions {
  property: string;
  target: any;
  fieldName?: string;
  type?: ColumnType;
  fetchType?: FetchType;
  updatable?: boolean;
  joinType?: JoinType;
  joinTablename?: string;
  joinColumn?: string;
  inverseJoin?: string;
  mappedBy?: string;
  orphanRemoval?: boolean;
}

export interface WhereOptions {
  tablename: string;
  fieldFK: string;
  foreignTablename: string;
  foreignFieldPK: string;
}