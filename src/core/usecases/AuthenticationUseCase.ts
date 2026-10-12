import { SimpleLogger } from '../../deepcore/application/helpers/SimpleLogger';
import { Security } from '../../deepcore/application/utils/Security';
import { UseCase, UseCaseOptions } from '../../deepcore/contracts/UseCase';
import { AuthenticationDTO } from '../contracts/datatransfers/AuthenticationDTO';
import { Dates } from '../helpers/DatesHelper';
import { useReject, useResolve } from '../helpers/functions/Promises';
import { LABEL } from '../helpers/LabelHelper';
import { UserService } from '../services/UserService';


export class AuthenticationUseCase implements UseCase {

  static readonly Error = {
    UserNotFound: 'UserNotFound',
    EmailOrPassword: 'EmailOrPassword',
  };

  private userService: UserService = new UserService();

  async execute<T>(options: UseCaseOptions): Promise<T> {
    try {
      const {
        email,
        password,
        requestId,
      } = options;

      const user = await this.userService.getByEmail(email);

      if (!user?._id) {
        SimpleLogger.warning(`No se encontró el usuario con el email: ${email}`, 'AuthenticationUseCase', requestId);
        return useReject(new Error(AuthenticationUseCase.Error.UserNotFound));
      }

      if (!Security.validatePassword(password, user.password)) {
        SimpleLogger.warning(`El password proveido es invalido.`, 'AuthenticationUseCase', requestId);
        return useReject(new Error(AuthenticationUseCase.Error.EmailOrPassword));
      }

      const userProfile = {
        name: user.name,
        email: user.email,
        status: user.status,
        statusLabel: LABEL.parse(user.status),
        createdAt: user.createdAt,
        createdAtLabel: Dates.millisToLocalUserDatetime(user.createdAt),
      } as AuthenticationDTO;

      return useResolve(userProfile);
    }
    catch (error) {
      SimpleLogger.error(`Ocurrio un error no manejado: ${error.message}`, 'AuthenticationUseCase', options.requestId);
      return useReject(error);
    }
  }

}

