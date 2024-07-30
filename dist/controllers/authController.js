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
// Helper function to create a new user
function createUser(userName, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashedPassword = yield User_1.default.hashPassword(password);
            const result = yield (0, db_1.default)("INSERT INTO users (userName, email, password) OUTPUT INSERTED.* VALUES (@userName, @email, @password)", { userName: userName, email: email, password: hashedPassword });
            if (result && result.length > 0) {
                return new User_1.default(result[0]);
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
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
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
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@email", { email: user.email });
    if (!result) {
        return res.status(400).json({ message: "User not found" });
    }
    const token = (0, jwt_1.generateToken)(result[0]);
    res.json({ token, message: "Login successful" });
});
exports.login = login;
const azureAdLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // Correctly type the user
    const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@email", { email: user.email });
    if (!result) {
        return res.status(400).json({ message: "User not found" });
    }
    const token = (0, jwt_1.generateToken)(result[0]);
    res.json({ token, message: "Login successful" });
});
exports.azureAdLogin = azureAdLogin;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'Logout successful' });
});
exports.logout = logout;
//# sourceMappingURL=authController.js.map