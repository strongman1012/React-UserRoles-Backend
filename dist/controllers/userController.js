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
exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)("SELECT users.*, roles.name role_name, business_units.name business_name  FROM users LEFT JOIN roles ON users.role_id = roles.id LEFT JOIN business_units ON users.business_unit_id = business_units.id");
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllUsers = getAllUsers;
// Get a user by ID
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)("SELECT * FROM users WHERE id=@id", { id });
        if (result && result.length > 0) {
            res.status(200).json(result[0]);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUser = getUser;
// Update a user by ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id } = req.body;
    try {
        // Construct the SET clause dynamically
        let setClause = '';
        const params = { id };
        if (userName !== undefined) {
            setClause += 'userName=@userName, ';
            params.userName = userName;
        }
        if (email !== undefined) {
            setClause += 'email=@email, ';
            params.email = email;
        }
        if (fullName !== undefined) {
            setClause += 'fullName=@fullName, ';
            params.fullName = fullName;
        }
        if (role_id !== undefined) {
            setClause += 'role_id=@role_id, ';
            params.role_id = role_id;
        }
        if (mobilePhone !== undefined) {
            setClause += 'mobilePhone=@mobilePhone, ';
            params.mobilePhone = mobilePhone;
        }
        if (mainPhone !== undefined) {
            setClause += 'mainPhone=@mainPhone, ';
            params.mainPhone = mainPhone;
        }
        if (status !== undefined) {
            setClause += 'status=@status, ';
            params.status = status;
        }
        if (business_unit_id !== undefined) {
            setClause += 'business_unit_id=@business_unit_id, ';
            params.business_unit_id = business_unit_id;
        }
        // Remove the trailing comma and space from the SET clause
        setClause = setClause.slice(0, -2);
        if (!setClause) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        const query = `UPDATE users SET ${setClause} WHERE id=@id`;
        const result = yield (0, db_1.default)(query, params);
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'User updated successfully' });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUser = updateUser;
// Delete a user by ID
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)("DELETE FROM users WHERE id=@id", { id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'User deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map