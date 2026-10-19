import { RegularExpression } from '../../../core/commons/constants/RegexConstants';
import { AuthenticationDTO } from '../../../core/contracts/datatransfers/AuthenticationDTO';
import { AuthenticationUseCase } from '../../../core/usecases/AuthenticationUseCase';
import { SimpleLogger } from '../../../deepcore/application/helpers/SimpleLogger';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../deepcore/application/http/HttpContracts';
import { ResponseEntity } from '../../../deepcore/application/http/ResponseEntity';
import { ProvideLoggerMiddleware } from '../../../deepcore/application/middlify/middleware/LoggerMiddleware';
import { Middlify } from '../../../deepcore/application/middlify/Middlify';


interface RequestBody {
  email: string;
  password: string;
}

const Authentication: ApiProxyHandler = async (event: ApiEvent): Promise<ApiProxyResult> => {
  try {
    const {
      email, password,
    } = event.body as RequestBody;

    if (!email || !RegularExpression.Email.test(email)) {
      SimpleLogger.warning(`El email es invalido: ${email}`, 'AuthenticationHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    if (!password) {
      SimpleLogger.warning(`El password es invalido`, 'AuthenticationHandler', event.requestId);
      return ResponseEntity.badRequest();
    }

    const authenticationUseCase = new AuthenticationUseCase();
    let userProfile: AuthenticationDTO;

    try {
      userProfile = await authenticationUseCase.execute<AuthenticationDTO>({
        email, password, requestId: event.requestId,
      });
    }
    catch (error: any) {
      if (error.message === AuthenticationUseCase.Error.UserNotFound) {
        SimpleLogger.warning(`El usuario no existe con el email: ${email}`, 'AuthenticationHandler', event.requestId);
        return ResponseEntity.notFound();
      }

      if (error.message === AuthenticationUseCase.Error.EmailOrPassword) {
        SimpleLogger.warning(`El password con coincide con el almacenado`, 'AuthenticationHandler', event.requestId);
        return ResponseEntity.conflict('email_or_password_error');
      }

      SimpleLogger.warning(`Ocurrió un error no manejado: ${error.message}`, 'AuthenticationHandler', event.requestId);
      throw new Error(error.message);
    }

    return ResponseEntity.ok(userProfile);
  }
  catch (error) {
    return ResponseEntity.error(error);
  }
}

export const AuthenticationHandler = Middlify(Authentication, [
  ProvideLoggerMiddleware('AuthenticationHandler'),
]);

