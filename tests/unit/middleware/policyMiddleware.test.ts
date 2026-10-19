import { ObjectId } from 'mongodb';
import { UserRepository } from '../../../src/adapters/persistence/UserRepository';
import { RoleCode } from '../../../src/core/domain/Role';
import { User } from '../../../src/core/domain/User';
import { ApiEvent, ApiProxyHandler, ApiProxyResult } from '../../../src/deepcore/application/http/HttpContracts';
import { ProvidePolicyMiddleware } from '../../../src/deepcore/application/middlify/middleware/PolicyMiddleware';
import { Security } from '../../../src/deepcore/application/utils/Security';

jest.mock('../../../src/adapters/persistence/UserRepository', () => ({ UserRepository: jest.fn() }));
jest.mock('../../../src/deepcore/application/utils/Security', () => ({ Security: { validateJSONWebToken: jest.fn() } }));

const id = new ObjectId();
const findOneByFilter = jest.fn();
const validateToken = Security.validateJSONWebToken as jest.Mock;
const mockedRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
let next: jest.MockedFunction<ApiProxyHandler>;
let event: ApiEvent;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockedRepository.mockImplementation(() => ({ findOneByFilter }) as unknown as UserRepository);
  findOneByFilter.mockResolvedValue({ _id: id, status: 'active', roles: ['user'] });
  validateToken.mockResolvedValue({ email: 'test@example.com' });
  next = jest.fn().mockResolvedValue(new ApiProxyResult({ saved: true }, 201));
  event = {
    url: '/api/v1/harmonic-templates', method: 'POST', headers: { authorization: 'Bearer test-token' },
    pathParameters: {}, queryStringParameters: {}, body: {}, clientIp: '127.0.0.1', requestId: 'test-request',
    appVersion: '', platform: '', operatingSystem: '', webbrowser: '', principalUser: undefined,
    security: '', context: {}, resourceName: '/api/v1/harmonic-templates',
  };
});
afterEach(() => { jest.restoreAllMocks(); });

describe('role authorization middleware', () => {
  it('loads the user by verified email and injects the database identity', async () => {
    const user = { _id: id, status: 'active', roles: ['user'], name: 'Test user' };
    findOneByFilter.mockResolvedValue(user);
    const result = await ProvidePolicyMiddleware(['user'])(event, next);
    expect(result.body.status).toBe(201);
    expect(validateToken).toHaveBeenCalledWith('test-token');
    expect(findOneByFilter).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(event.principalUser).toBe(user);
    expect(next).toHaveBeenCalledWith(event);
  });

  it('accepts multiple roles when any database role is allowed', async () => {
    findOneByFilter.mockResolvedValue({ _id: id, status: 'active', roles: ['operador', 'user'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
  });

  it('accepts an active superuser even when the role is not listed', async () => {
    findOneByFilter.mockResolvedValue({ _id: id, status: 'active', roles: ['sudosu'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
    expect((await ProvidePolicyMiddleware([])(event, next)).body.status).toBe(201);
  });

  it.each([[], undefined, null, 'user', ['operador'], [{ code: 'user' }], ['SUPER_USER'], ['superuser']].map((roles) => [roles]))('rejects absent or unmatched role data: %j', async (roles) => {
    findOneByFilter.mockResolvedValue({ _id: id, status: 'active', roles });
    const result = await ProvidePolicyMiddleware(['user'])(event, next);
    expect(result.body).toEqual({ status: 403, payload: '403 Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not give regular users access to a superuser-only handler', async () => {
    expect((await ProvidePolicyMiddleware(['sudosu'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies regular users when the handler allows no roles', async () => {
    expect((await ProvidePolicyMiddleware([])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['inactive', 'deleted', undefined])('rejects a superuser whose account is not active: %s', async (status) => {
    findOneByFilter.mockResolvedValue({ _id: id, status, roles: ['sudosu'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'Basic test-token', 'prefix Bearer test-token', 'Bearer', 'Bearer a b'])('rejects malformed authorization before reading the database: %s', async (authorization) => {
    event.headers = { authorization };
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(validateToken).not.toHaveBeenCalled();
    expect(mockedRepository).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts case-insensitive Bearer and the capitalized header name', async () => {
    event.headers = { Authorization: 'bearer test-token' };
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
  });

  it.each(['invalid token', 'jwt expired'])('rejects invalid or expired JWTs: %s', async (message) => {
    validateToken.mockRejectedValueOnce(new Error(message));
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(mockedRepository).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([{}, { email: '' }, { email: 'invalid' }, { email: { $ne: null } }, { sub: id.toHexString() }, null])('rejects missing or malformed signed emails without querying MongoDB: %j', async (principal) => {
    validateToken.mockResolvedValueOnce(principal);
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(mockedRepository).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a missing database user', async () => {
    findOneByFilter.mockResolvedValue({});
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('never authorizes using roles from the token, event or request body', async () => {
    validateToken.mockResolvedValue({ email: 'test@example.com', roles: ['sudosu'] });
    event.principalUser = { roles: ['sudosu'] };
    event.body = { roles: ['sudosu'], allowedRoles: ['operador'] };
    event.allowedRoles = ['operador'];
    findOneByFilter.mockResolvedValue({ _id: id, status: 'active', roles: ['operador'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts the real login JWT format without sub and rejects a tampered signature', async () => {
    const realSecurity = jest.requireActual('../../../src/deepcore/application/utils/Security').Security;
    validateToken.mockImplementation((token) => realSecurity.validateJSONWebToken(token));
    const token = realSecurity.getJSONWebTokenByData({ email: 'test@example.com', name: 'Test user' });
    event.headers = { authorization: 'Bearer ' + token };
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
    expect(findOneByFilter).toHaveBeenCalledWith({ email: 'test@example.com' });
    next.mockClear();
    const parts = token.split('.');
    parts[1] = Buffer.from(JSON.stringify({ email: 'other@example.com' })).toString('base64url');
    event.headers = { authorization: 'Bearer ' + parts.join('.') };
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('normalizes only the signed email and ignores client-provided identities', async () => {
    validateToken.mockResolvedValue({ email: ' Test@Example.com ', sub: 'ignored' });
    event.body = { email: 'attacker@example.com' };
    event.queryStringParameters = { email: 'attacker@example.com' };
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
    expect(findOneByFilter).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('reads updated database roles on each request', async () => {
    const middleware = ProvidePolicyMiddleware(['user']);
    expect((await middleware(event, next)).body.status).toBe(201);
    findOneByFilter.mockResolvedValueOnce({ _id: id, status: 'active', roles: [] });
    expect((await middleware(event, next)).body.status).toBe(403);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('captures allowed roles without exposing them to event mutation', async () => {
    const allowed: RoleCode[] = ['user'];
    const middleware = ProvidePolicyMiddleware(allowed);
    allowed.splice(0);
    expect((await middleware(event, next)).body.status).toBe(201);
  });

  it('preserves errors from the handler instead of converting them to forbidden', async () => {
    const middleware = ProvidePolicyMiddleware(['user']);
    next.mockRejectedValueOnce(new Error('handler failure'));
    await expect(middleware(event, next)).rejects.toThrow('handler failure');
    next.mockImplementationOnce(() => { throw new Error('synchronous handler failure'); });
    await expect(middleware(event, next)).rejects.toThrow('synchronous handler failure');
  });

  it('gives new user records no implicit roles', () => {
    expect(new User().roles).toEqual([]);
  });
});
