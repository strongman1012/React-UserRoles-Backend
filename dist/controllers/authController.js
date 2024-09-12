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
exports.logout = exports.azureAdLogin = exports.loginWithToken = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../config/jwt");
const db_1 = __importDefault(require("../config/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginReportController_1 = require("../controllers/loginReportController");
const areaListController_1 = require("./areaListController");
const settingController_1 = require("./settingController");
// Helper function to create a new user
function createUser(userName, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashedPassword = yield User_1.default.hashPassword(password);
            const status = true;
            const result = yield (0, db_1.default)("INSERT INTO users (userName, email, password, status) OUTPUT INSERTED.* VALUES (@userName, @email, @password, @status)", { userName, email, password: hashedPassword, status });
            if (result && result.length > 0) {
                return result[0];
            }
            return null;
        }
        catch (err) {
            console.error('Error creating user:', err);
            return null;
        }
    });
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password } = req.body;
    if (!userName) {
        return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    try {
        const existingUser = yield User_1.default.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const newUser = yield createUser(userName, email, password);
        if (!newUser) {
            return res.status(500).json({ message: "Error creating user" });
        }
        res.status(201).json({ message: "Registration successful" });
    }
    catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Correctly type the user
    const { application } = req.body;
    const date = new Date().toISOString();
    // Fetch the user from the database
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: user.email });
    if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }
    // Get user's role IDs
    const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string
    // Check if the application exists and fetch its ID
    const applicationResult = yield (0, db_1.default)("SELECT id FROM applications WHERE name=@application", { application });
    if (!applicationResult || applicationResult.length === 0) {
        return res.status(400).json({ message: "Application not found" });
    }
    const applicationId = applicationResult[0].id;
    // Check if any of the user's roles have permission for this application
    let hasPermission = false;
    for (const roleId of role_ids) {
        const permissionResult = yield (0, db_1.default)("SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId", { roleId, applicationId });
        if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
            hasPermission = true;
            break;
        }
    }
    // Respond based on permission
    if (hasPermission) {
        const userAreas = yield (0, areaListController_1.getUserAreas)(result[0].role_ids);
        const setting = yield (0, settingController_1.getSetting)(result[0].id);
        const token = yield (0, jwt_1.generateToken)(result[0]);
        (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, true, token);
        return res.json({ token, message: "Login successful", userAreas, setting });
    }
    else {
        (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, false, null);
        return res.status(403).json({ message: "You don’t have permission to access this application" });
    }
});
exports.login = login;
// login by token
const loginWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, application } = req.body;
    if (token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        const user = decoded === null || decoded === void 0 ? void 0 : decoded.user;
        const date = new Date().toISOString();
        // Fetch the user from the database
        const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: user.email });
        if (!result || result.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        // Get user's role IDs
        const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string
        // Check if the application exists and fetch its ID
        const applicationResult = yield (0, db_1.default)("SELECT id FROM applications WHERE name=@application", { application });
        if (!applicationResult || applicationResult.length === 0) {
            return res.status(400).json({ message: "Application not found" });
        }
        const applicationId = applicationResult[0].id;
        // Check if any of the user's roles have permission for this application
        let hasPermission = false;
        for (const roleId of role_ids) {
            const permissionResult = yield (0, db_1.default)("SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId", { roleId, applicationId });
            if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
                hasPermission = true;
                break;
            }
        }
        // Respond based on permission
        if (hasPermission) {
            const userAreas = yield (0, areaListController_1.getUserAreas)(result[0].role_ids);
            const setting = yield (0, settingController_1.getSetting)(result[0].id);
            const token = yield (0, jwt_1.generateToken)(result[0]);
            (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, true, token);
            return res.json({ token, message: "Login successful", userAreas, setting });
        }
        else {
            (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, false, null);
            return res.status(403).json({ message: "You don’t have permission to access this application" });
        }
    }
});
exports.loginWithToken = loginWithToken;
const azureAdLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Correctly type the user
    const { application } = req.body;
    const date = new Date().toISOString();
    // Fetch the user from the database
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: user.email });
    if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }
    // Get user's role IDs
    const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string
    // Check if the application exists and fetch its ID
    const applicationResult = yield (0, db_1.default)("SELECT id FROM applications WHERE name=@application", { application });
    if (!applicationResult || applicationResult.length === 0) {
        return res.status(400).json({ message: "Application not found" });
    }
    const applicationId = applicationResult[0].id;
    // Check if any of the user's roles have permission for this application
    let hasPermission = false;
    for (const roleId of role_ids) {
        const permissionResult = yield (0, db_1.default)("SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId", { roleId, applicationId });
        if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
            hasPermission = true;
            break;
        }
    }
    // Respond based on permission
    if (hasPermission) {
        const userAreas = yield (0, areaListController_1.getUserAreas)(result[0].role_ids);
        const setting = yield (0, settingController_1.getSetting)(result[0].id);
        const token = yield (0, jwt_1.generateToken)(result[0]);
        (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, true, token);
        return res.json({ token, message: "Login successful", userAreas, setting });
    }
    else {
        (0, loginReportController_1.createLoginReport)(user.id, date, "Login", application, false, null);
        return res.status(403).json({ message: "You don’t have permission to access this application" });
    }
});
exports.azureAdLogin = azureAdLogin;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const { application } = req.body;
    if (token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        const auth = decoded === null || decoded === void 0 ? void 0 : decoded.user;
        // Current timestamp
        const date = new Date();
        const login_session = yield (0, db_1.default)("SELECT * FROM login_reports WHERE token=@token", { token });
        const login_time = new Date(login_session === null || login_session === void 0 ? void 0 : login_session[0].date);
        // Calculate the difference in minutes
        const diffInMinutes = Math.floor((date.getTime() - login_time.getTime()) / 60000);
        // If the difference is greater than 60, set the duration to 60
        const duration = diffInMinutes > 60 ? 60 : diffInMinutes;
        const real_logout_time = new Date(login_time.getTime() + duration * 60000).toISOString();
        const result = yield (0, db_1.default)("UPDATE login_reports SET usage_time=@usage_time WHERE token=@token", { usage_time: duration, token });
        if (result && result.length > 0) {
            (0, loginReportController_1.createLoginReport)(auth.id, real_logout_time, "Logout", application, true, null);
            res.status(200).json({ message: 'Logout successful' });
        }
    }
});
exports.logout = logout;
//# sourceMappingURL=authController.js.map