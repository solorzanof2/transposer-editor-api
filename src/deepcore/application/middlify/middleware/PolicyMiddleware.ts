import { UserRepository } from '../../../../adapters/persistence/UserRepository';
import { GlobalStatus } from '../../../../core/commons/constants/GlobalConstants';
import { RoleCode, RoleCodes } from '../../../../core/domain/Role';
import { User } from '../../../../core/domain/User';
import { PrincipalUserDTO } from '../../../../core/utils/security/PrincipalUser';
import { ApiEvent, ApiProxyHandler, ApiProxyResult, HttpStatus } from '../../http/HttpContracts';
import { Security } from '../../utils/Security';
import { Middleware } from '../Middlify';

const ForbiddenMessage = '403 Forbidden';

const PolicyMiddleware = async (
  event: ApiEvent,
  next: ApiProxyHandler,
  allowedRoles: readonly RoleCode[],
): Promise<ApiProxyResult> => {
  let user: User;
  try {
    const authorization = event.headers.Authorization || event.headers.authorization;
    const match = typeof authorization === 'string' ? authorization.match(/^Bearer\s+(\S+)$/i) : null;
    if (!match) throw new Error('invalid_authorization');

    const tokenInfo = await Security.validateJSONWebToken<PrincipalUserDTO>(match[1]);
    // Identidad firmada del login actual; nunca leerla del body o query.
    if (typeof tokenInfo?.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tokenInfo.email.trim())) {
      throw new Error('invalid_identity');
    }

    const userRepository = new UserRepository();
    user = await userRepository.findOneByFilter({ email: tokenInfo.email.trim().toLowerCase() });
    if (!user?._id || user.status !== GlobalStatus.Active || !userCanProceed(user.roles, allowedRoles)) {
      throw new Error('user_access_denied');
    }
  } catch {
    console.error('[ERR0] PolicyMiddleware - Access denied.');
    return new ApiProxyResult(ForbiddenMessage, HttpStatus.Forbidden);
  }

  event.principalUser = user;
  // Los errores del handler deben conservar su tratamiento, no convertirse en 403.
  return next(event);
};

export const ProvidePolicyMiddleware = (allowedRoles: RoleCode[]): Middleware => {
  // La configuración del handler no depende del Event ni de cambios del array original.
  const roles: readonly RoleCode[] = Object.freeze([...allowedRoles]);
  return (event, next) => PolicyMiddleware(event, next, roles);
};

const userCanProceed = (roles: RoleCode[] | undefined, allowedRoles: readonly RoleCode[]): boolean => {
  if (!Array.isArray(roles)) return false;
  return roles.includes(RoleCodes.SuperUser) || roles.some((role) => allowedRoles.includes(role));
};
