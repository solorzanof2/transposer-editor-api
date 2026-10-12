import { Collection, ObjectId } from 'mongodb';
import { DatabaseContext } from './DatabaseContext';
import { MongoDBClient } from './MongoDBClient';


export class MongoRepository<T> {

  protected model: Collection

  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    const client = DatabaseContext.getInstance().getDatabase() as MongoDBClient;
    this.model = client.database.collection(collectionName);
  }

  async findById(value: ObjectId): Promise<T> {
    try {
      const result = (await this.model.findOne({ _id: value })) as T;

      if (!result) {
        return Promise.resolve({} as T);
      }

      return Promise.resolve(result as T);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async findOneByFilter(value: any): Promise<T> {
    try {
      const result = (await this.model
        .findOne({ ...value }));

      if (!result?._id) {
        return Promise.resolve({} as T);
      }

      return Promise.resolve(result as T);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async findAllByFilter(value: any): Promise<T[]> {
    try {
      const result = (await this.model
        .find({ ...value }).toArray()) as T[];

      if (!result?.length) {
        return Promise.resolve(new Array<T>());
      }

      return Promise.resolve(result as T[]);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async findByStatus(value: string): Promise<T[]> {
    try {
      const results = (await this.model.find({ status: value }).toArray()) as T[];

      if (!results?.length) {
        return Promise.resolve(new Array<T>());
      }

      return Promise.resolve(results);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const results = (await this.model.find().toArray()) as T[];

      if (!results?.length)  {
        return Promise.resolve(new Array<T>());
      }

      return Promise.resolve(results);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteById(value: string): Promise<void> {
    try {
      const results = await this.model.deleteOne({
        _id: new ObjectId(value),
      });

      if (!results?.deletedCount) {
        return Promise.reject(new Error('mongodb_delete_failure'));
      }

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteByFilter(value: any): Promise<void> {
    try {
      const results = await this.model.deleteOne(value);

      if (!results?.deletedCount) {
        return Promise.reject(new Error('mondodb_delete_failure'));
      }

      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async save(model: T): Promise<string> {
    try {
      const result = await this.model.insertOne(model);

      if (!result?.insertedId) {
        return Promise.reject(new Error('mongodb_insert_failure'));
      }

      return Promise.resolve(result.insertedId.toString());
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async update(model: any): Promise<T> {
    try {
      const {
        _id, ...data
      } = model;

      const result = await this.model.findOneAndUpdate({
        _id: model._id,
      }, {
        $set: { ...data }
      });

      if (!result?._id) {
        return Promise.reject(new Error('mongodb_update_failure'));
      }

      return Promise.resolve(result as T);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

}


