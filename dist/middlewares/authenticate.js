"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJwt = exports.azureAuthenticate = exports.authenticate = void 0;
const passport_1 = __importDefault(require("../config/passport"));
const jwt_1 = require("../config/jwt");
const authenticate = (req, res, next) => {
    passport_1.default.authenticate('local', { failureRedirect: '/login' }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        next();
    })(req, res, next);
};
exports.authenticate = authenticate;
const azureAuthenticate = (req, res, next) => {
    passport_1.default.authenticate('oauth-bearer', { failureRedirect: '/login' }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        next();
    })(req, res, next);
};
exports.azureAuthenticate = azureAuthenticate;
const checkJwt = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.checkJwt = checkJwt;
//# sourceMappingURL=authenticate.js.map