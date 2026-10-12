import { Partition } from '../../core/commons/constants/Partitions';
import { User } from '../../core/domain/User';
import { MongoRepository } from '../../deepcore/infrastructure/persistence/MongoRepository';

export class UserRepository extends MongoRepository<User> {

  constructor() {
    super(Partition.Users);
  }

}

