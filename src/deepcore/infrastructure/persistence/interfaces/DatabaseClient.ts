export interface DatabaseClient {
  prepare(builder: any): Promise<any[] | any>;
  plainExecute(query: string, isExternal?: boolean): Promise<any[] | any>;
  execute(query: string, values: any[], isExternal?: boolean): Promise<any[] | any>;
}

export interface DatabaseConfiguration {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  logginSQL: boolean;
}

export interface StatementResult {
  affectedRows?: number;
  insertId?: number;
  rowCount?: number;
  rows?: any[];
}