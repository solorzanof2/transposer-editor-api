import { UserRepository } from '../../adapters/persistence/UserRepository';
import { User } from '../domain/User';
import { useReject, useResolve } from '../helpers/functions/Promises';


export class UserService {

  private userRepository: UserRepository = new UserRepository();

  constructor() { }

  async getByEmail(value: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByFilter({ email: value.toLowerCase() });

      if (!user?._id) {
        return useResolve(null);
      }

      return useResolve(user);
    }
    catch (error) {
      return useReject(error);
    }
  }

}
