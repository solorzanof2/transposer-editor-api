import { MongoDBModel } from '../../deepcore/infrastructure/persistence/models/MongoDBModel';
import { GlobalStatus } from '../commons/constants/GlobalConstants';
import { RoleCode } from './Role';


export class User extends MongoDBModel {

  name: string = '';
  email: string = '';
  password: string = '';
  status: string = GlobalStatus.Active;
  roles: RoleCode[] = [];
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor() {
    super();
  }

}


