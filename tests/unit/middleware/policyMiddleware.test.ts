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
const findById = jest.fn();
const validateToken = Security.validateJSONWebToken as jest.Mock;
const mockedRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
let next: jest.MockedFunction<ApiProxyHandler>;
let event: ApiEvent;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockedRepository.mockImplementation(() => ({ findById }) as unknown as UserRepository);
  findById.mockResolvedValue({ _id: id, status: 'active', roles: ['user'] });
  validateToken.mockResolvedValue({ sub: id.toHexString() });
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
  it('loads the user by MongoDB subject and injects the database identity', async () => {
    const user = { _id: id, status: 'active', roles: ['user'], name: 'Test user' };
    findById.mockResolvedValue(user);
    const result = await ProvidePolicyMiddleware(['user'])(event, next);
    expect(result.body.status).toBe(201);
    expect(validateToken).toHaveBeenCalledWith('test-token');
    expect(findById).toHaveBeenCalledWith(id);
    expect(event.principalUser).toBe(user);
    expect(next).toHaveBeenCalledWith(event);
  });

  it('accepts multiple roles when any database role is allowed', async () => {
    findById.mockResolvedValue({ _id: id, status: 'active', roles: ['operador', 'user'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
  });

  it('accepts an active superuser even when the role is not listed', async () => {
    findById.mockResolvedValue({ _id: id, status: 'active', roles: ['sudosu'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(201);
    expect((await ProvidePolicyMiddleware([])(event, next)).body.status).toBe(201);
  });

  it.each([[], undefined, null, 'user', ['operador'], [{ code: 'user' }], ['SUPER_USER'], ['superuser']].map((roles) => [roles]))('rejects absent or unmatched role data: %j', async (roles) => {
    findById.mockResolvedValue({ _id: id, status: 'active', roles });
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
    findById.mockResolvedValue({ _id: id, status, roles: ['sudosu'] });
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

  it.each([{}, { sub: 'invalid-id' }, { uid: id.toHexString() }, { sub: { $ne: null } }, null])('rejects missing or malformed subjects without querying MongoDB: %j', async (principal) => {
    validateToken.mockResolvedValueOnce(principal);
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(mockedRepository).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a missing database user', async () => {
    findById.mockResolvedValue({});
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('never authorizes using roles from the token, event or request body', async () => {
    validateToken.mockResolvedValue({ sub: id.toHexString(), roles: ['sudosu'] });
    event.principalUser = { roles: ['sudosu'] };
    event.body = { roles: ['sudosu'], allowedRoles: ['operador'] };
    event.allowedRoles = ['operador'];
    findById.mockResolvedValue({ _id: id, status: 'active', roles: ['operador'] });
    expect((await ProvidePolicyMiddleware(['user'])(event, next)).body.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('reads updated database roles on each request', async () => {
    const middleware = ProvidePolicyMiddleware(['user']);
    expect((await middleware(event, next)).body.status).toBe(201);
    findById.mockResolvedValueOnce({ _id: id, status: 'active', roles: [] });
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
