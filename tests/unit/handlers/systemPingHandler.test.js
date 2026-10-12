"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PingHandler_1 = require("../../../src/adapters/handlers/system/PingHandler");
const mockEvent = {
    url: '',
    method: '',
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
    body: {},
    clientIp: '',
    requestId: '',
    appVersion: '',
    platform: '',
    operatingSystem: '',
    webbrowser: '',
    principalUser: {},
    security: '',
    context: {},
    resourceName: '',
};
describe('SystemPingHandlerTest', () => {
    test('Debe retornar la descripción del Sistema', async () => {
        const response = await (0, PingHandler_1.SystemPingHandler)(mockEvent);
        expect(response.body.status).toBe(200);
    });
});
//# sourceMappingURL=systemPingHandler.test.js.map