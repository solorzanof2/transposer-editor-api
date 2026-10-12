import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';
import { GlobalStatus } from '../commons/constants/GlobalConstants';


export class User extends MongoDBModel {

  name: string = '';
  email: string = '';
  password: string = '';
  status: string = GlobalStatus.Active;
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor() {
    super();
  }

}


