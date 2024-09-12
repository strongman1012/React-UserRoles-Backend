"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_azure_ad_1 = require("passport-azure-ad");
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config/config"));
const loginReportController_1 = require("../controllers/loginReportController");
// Local Strategy
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByEmail(email);
        // Current timestamp
        const date = new Date().toISOString();
        const { application } = req.body;
        if (!user) {
            return done(null, false, { message: 'That email is not registered' });
        }
        if (!user.status) {
            (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, false, null);
            return done(null, false, { message: "You are not allowed" });
        }
        const isMatch = yield user.validPassword(password);
        if (isMatch) {
            return done(null, user);
        }
        else {
            (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, false, null);
            return done(null, false, { message: 'Password incorrect' });
        }
    }
    catch (err) {
        return done(err);
    }
})));
// Azure AD Bearer Strategy
const options = {
    identityMetadata: `https://login.microsoftonline.com/${config_1.default.azure.tenantId}/v2.0/.well-known/openid-configuration`,
    clientID: config_1.default.azure.clientId,
    validateIssuer: true,
    issuer: `https://sts.windows.net/${config_1.default.azure.tenantId}/`,
    passReqToCallback: true,
    audience: config_1.default.azure.clientId,
    scope: ["access_as_user"]
};
passport_1.default.use(new passport_azure_ad_1.BearerStrategy(options, (req, token, done) => {
    User_1.default.findByEmail(token.preferred_username)
        .then((user) => {
        if (!user) {
            return done(null, false);
        }
        return done(null, user, token);
    })
        .catch((err) => done(err, null));
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(id);
        if (user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
    catch (err) {
        done(err);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map