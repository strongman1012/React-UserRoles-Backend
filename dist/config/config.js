"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    db: {
        server: (_a = process.env.DB_SERVER) !== null && _a !== void 0 ? _a : '',
        user: (_b = process.env.DB_USER) !== null && _b !== void 0 ? _b : '',
        password: (_c = process.env.DB_PASSWORD) !== null && _c !== void 0 ? _c : '',
        database: (_d = process.env.DB_DATABASE) !== null && _d !== void 0 ? _d : ''
    },
    jwtSecret: (_e = process.env.JWT_SECRET) !== null && _e !== void 0 ? _e : '',
    azure: {
        clientId: (_f = process.env.AZURE_CLIENT_ID) !== null && _f !== void 0 ? _f : '',
        tenantId: (_g = process.env.AZURE_TENANT_ID) !== null && _g !== void 0 ? _g : '',
        audience: (_h = process.env.AZURE_AUDIENCE) !== null && _h !== void 0 ? _h : ''
    },
    port: (_j = process.env.PORT) !== null && _j !== void 0 ? _j : 5000
};
exports.default = config;
//# sourceMappingURL=config.js.map