import { Route } from '../../../deepcore/contracts/Route';
import { AuthenticationHandler } from './AuthenticationHandler';


export const PublicRouting: Route[] = [
  {
    path: '/api/v1/publics/auth',
    method: 'post',
    handler: AuthenticationHandler,
  },
];

