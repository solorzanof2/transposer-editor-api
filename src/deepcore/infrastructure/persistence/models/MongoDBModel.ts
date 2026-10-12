import {
  ObjectId,
  Document as MongoDocument,
} from 'mongodb';

export class MongoDBModel implements MongoDocument {

  _id: ObjectId;

  constructor() {
    this._id = new ObjectId();
  }

}

