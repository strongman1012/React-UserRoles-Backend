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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db")); // Import your SQL module
class User {
    constructor({ id, userName, email, password, status }) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.status = status;
    }
    validPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bcryptjs_1.default.compare(password, this.password);
            }
            catch (error) {
                throw new Error('Error validating password');
            }
        });
    }
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, db_1.default)("SELECT * FROM users WHERE email=@user", { user: email });
            if (result && result.length > 0) {
                return result[0];
            }
            return null;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, db_1.default)("SELECT * FROM users WHERE id=@id", { id });
            if (result && result.length > 0) {
                return new User(result[0]);
            }
            return null;
        });
    }
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                return hashedPassword;
            }
            catch (error) {
                console.error('Error in bcrypt operations:', error);
                throw new Error('Error hashing password');
            }
        });
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map