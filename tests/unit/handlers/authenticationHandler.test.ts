import { AuthenticationHandler } from '../../../src/adapters/handlers/publics/AuthenticationHandler';
import { AuthenticationUseCase } from '../../../src/core/usecases/AuthenticationUseCase';
import { ApiEvent, ApiProxyHandler } from '../../../src/deepcore/application/http/HttpContracts';

jest.mock('../../../src/core/usecases/AuthenticationUseCase', () => ({
  AuthenticationUseCase: Object.assign(jest.fn(), { Error: { UserNotFound: 'UserNotFound', EmailOrPassword: 'EmailOrPassword' } }),
}));
jest.mock('../../../src/deepcore/application/helpers/SimpleLogger', () => ({ SimpleLogger: { warning: jest.fn(), error: jest.fn() } }));
jest.mock('../../../src/deepcore/application/middlify/middleware/LoggerMiddleware', () => ({
  ProvideLoggerMiddleware: () => (event: ApiEvent, next: ApiProxyHandler) => next(event),
}));

const execute = jest.fn();
const MockUseCase = AuthenticationUseCase as jest.MockedClass<typeof AuthenticationUseCase>;
function request(email: string, requestId: string): ApiEvent {
  return {
    url: '/api/v1/publics/auth', method: 'POST', headers: {}, pathParameters: {}, queryStringParameters: {},
    body: { email, password: 'test-password' }, clientIp: '127.0.0.1', requestId,
    appVersion: '', platform: '', operatingSystem: '', webbrowser: '', principalUser: undefined, security: '', context: {},
    resourceName: '/api/v1/publics/auth',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  MockUseCase.mockImplementation(() => ({ execute }) as unknown as AuthenticationUseCase);
  execute.mockResolvedValue({ name: 'Test user', email: 'usuario+editor@example.com' });
});

describe('authentication email validation across requests', () => {
  it('accepts separate requests with the same valid email without alternating 200/400', async () => {
    for (let index = 0; index < 6; index++) {
      const response = await AuthenticationHandler(request('usuario+editor@example.com', 'request-' + index));
      expect(response.body.status).toBe(200);
    }
    expect(execute).toHaveBeenCalledTimes(6);
  });

  it('rejects invalid input without affecting later valid requests', async () => {
    const first = await AuthenticationHandler(request('usuario+editor@example.com', 'first'));
    const invalid = await AuthenticationHandler(request('invalid', 'second'));
    const third = await AuthenticationHandler(request('usuario+editor@example.com', 'third'));
    expect([first.body.status, invalid.body.status, third.body.status]).toEqual([200, 400, 200]);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
