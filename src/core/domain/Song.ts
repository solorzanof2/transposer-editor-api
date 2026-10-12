import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';


export type EnharmonicPreference = 'sharp' | 'flat' | 'auto';

export class Song extends MongoDBModel {

  userId: string = '';
  title: string = '';
  artist?: string;
  source: string = '';
  originalKey?: string;
  lastTargetKey?: string;
  enharmonicPreference: EnharmonicPreference = 'auto';
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor() {
    super();
  }

}
