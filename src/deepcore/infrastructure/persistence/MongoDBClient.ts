import { Db, MongoClient } from 'mongodb';
import { DatabaseClient, DatabaseConfiguration } from './interfaces/DatabaseClient';
export interface MongoDBConfiguration extends DatabaseConfiguration {}
export class MongoDBClient implements DatabaseClient {
  static instance: MongoDBClient;
  private $database: Db;
  private client: MongoClient;
  private constructor(options: MongoDBConfiguration) {
    const url=options.host.startsWith('mongodb')?options.host:`mongodb://${options.host}:${options.port}`;
    this.client=new MongoClient(url);
    this.$database=this.client.db(options.name);
    this.client.connect().catch(error=>console.error(`[ERR0] MongoDBClient > ${error instanceof Error?error.message:error}`));
  }
  get database():Db{return this.$database;}
  static getInstance(options?:MongoDBConfiguration):MongoDBClient{if(!this.instance){if(!options)throw new Error('mongodb_configuration_required');this.instance=new MongoDBClient(options);}return this.instance;}
  async prepare(_builder:any):Promise<any>{}
  async plainExecute(_query:string,_isExternal=false):Promise<any>{}
  async execute(_query:string,_values:any[],_isExternal=false):Promise<any[]|any>{}
}
