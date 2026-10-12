import { Policy } from '../../core/domain/Policy';
import { MongoRepository } from '../../deepcore/infrastructure/persistence/MongoRepository';


export class PolicyRepository extends MongoRepository<Policy> {

  constructor() {
    super('policies');
  }

  async findByRoleIdIn(roleIds: string[]): Promise<Policy[]> {
    return await this.model.find({ roleId: { $in: roleIds } }).toArray() as unknown as Policy[];
  }

}
