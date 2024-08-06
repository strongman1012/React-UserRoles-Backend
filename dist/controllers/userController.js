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
exports.deleteUsers = exports.updateUser = exports.createUser = exports.getUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const db_1 = __importDefault(require("../config/db"));
const dataAccessController_1 = require("./dataAccessController");
const businessUnitController_1 = require("./businessUnitController");
// Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Users");
        const users = yield (0, db_1.default)("SELECT users.*, roles.name role_name, business_units.name business_name, teams.name team_name FROM users LEFT JOIN roles ON users.role_id = roles.id LEFT JOIN business_units ON users.business_unit_id = business_units.id LEFT JOIN teams ON users.team_id = teams.id");
        if (!users)
            return res.status(400).json({ message: 'Invalid users' });
        let result;
        let editable;
        if (userAccessLevel === 1) {
            result = users;
            editable = true;
        }
        else if (userAccessLevel === 2) {
            const childBusinessUnits = yield (0, businessUnitController_1.getChildBusinessUnits)(auth.business_unit_id);
            const usersInParentBusinessUnit = users.filter(user => user.business_unit_id === auth.business_unit_id);
            let usersInChildBusinessUnits = [];
            childBusinessUnits === null || childBusinessUnits === void 0 ? void 0 : childBusinessUnits.forEach(child => {
                const childBusinessUnitUsers = users.filter(user => user.business_unit_id === child.id);
                usersInChildBusinessUnits = usersInChildBusinessUnits.concat(childBusinessUnitUsers);
            });
            const totalUsersInBusinessUnit = usersInParentBusinessUnit.concat(usersInChildBusinessUnits);
            const teamIds = Array.from(new Set(totalUsersInBusinessUnit.map(user => user.team_id)));
            result = users.filter(user => teamIds.includes(user.team_id));
            editable = true;
        }
        else if (userAccessLevel === 3) {
            const usersInBusinessUnit = users.filter(user => user.business_unit_id === auth.business_unit_id);
            const teamIds = Array.from(new Set(usersInBusinessUnit.map(user => user.team_id)));
            result = users.filter(user => teamIds.includes(user.team_id));
            editable = true;
        }
        else if (userAccessLevel === 4) {
            result = users.filter(user => { return user.team_id === auth.team_id; });
            editable = true;
        }
        else if (userAccessLevel === 5) {
            result = users.filter(user => { return user.id === auth.id; });
            editable = false;
        }
        else {
            return res.status(400).json({ message: 'Invalid access level' });
        }
        res.status(200).json({ result: result, editable: editable });
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
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Users");
        let editable;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)("SELECT * FROM users WHERE id=@id", { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
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
// Create a new user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id } = req.body;
    const password = "12345";
    const hashedPassword = yield User_1.default.hashPassword(password);
    if (!userName) {
        return res.status(400).json({ message: "Username is required." });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO users (userName, email, password, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id) VALUES (@userName, @email, @password, @fullName, @role_id, @mobilePhone, @mainPhone, @status, @business_unit_id, @team_id)', { userName, email, password: hashedPassword, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id });
        if (result && result.length > 0) {
            res.status(201).json({ message: 'An user created successfully', user: result[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating user' });
        }
    }
    catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createUser = createUser;
// Update a user by ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id } = req.body;
    if (!userName) {
        return res.status(400).json({ message: "Username is required." });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
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
        if (team_id !== undefined) {
            setClause += 'team_id=@team_id, ';
            params.team_id = team_id;
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
// Delete a user by IDs
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }
    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
        const result = yield (0, db_1.default)(`DELETE FROM users WHERE id IN (${placeholders})`, parameters);
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Users deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Users not found' });
        }
    }
    catch (err) {
        console.error('Error deleting users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUsers = deleteUsers;
//# sourceMappingURL=userController.js.map