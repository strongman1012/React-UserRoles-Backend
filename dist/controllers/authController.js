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
exports.logout = exports.azureAdLogin = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../config/jwt");
const db_1 = __importDefault(require("../config/db"));
const loginReportController_1 = require("../controllers/loginReportController");
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
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: user.email });
    if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }
    const token = (0, jwt_1.generateToken)(result[0]);
    res.json({ token, message: "Login successful" });
});
exports.login = login;
const azureAdLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Correctly type the user
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: user.email });
    if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }
    const token = (0, jwt_1.generateToken)(result[0]);
    res.json({ token, message: "Login successful" });
});
exports.azureAdLogin = azureAdLogin;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    // Current timestamp
    const date = new Date().toISOString();
    const { application } = req.body;
    (0, loginReportController_1.createLoginReport)(auth.id, date, "Logout", application, true);
    res.status(200).json({ message: 'Logout successful' });
});
exports.logout = logout;
//# sourceMappingURL=authController.js.map