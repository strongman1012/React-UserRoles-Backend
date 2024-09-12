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
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRole = exports.getAllRoles = void 0;
const dataAccessController_1 = require("./dataAccessController");
const db_1 = __importDefault(require("../config/db"));
// Get all roles
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Roles");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM roles');
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllRoles = getAllRoles;
// Get a specific role by ID
const getRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Roles");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM roles WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        }
        else {
            res.status(404).json({ message: 'Role not found' });
        }
    }
    catch (err) {
        console.error('Error fetching role:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getRole = getRole;
// Create a new role
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Role name is required." });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO roles (name) VALUES (@name)', { name });
        if (result && result.length > 0) {
            const insertedRole = yield (0, db_1.default)('SELECT * FROM roles ORDER BY id DESC');
            res.status(201).json({ message: 'Role created successfully', role: insertedRole === null || insertedRole === void 0 ? void 0 : insertedRole[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating role' });
        }
    }
    catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createRole = createRole;
// Update an existing role
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Role name is required." });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE roles SET name = @name WHERE id = @id', { id, name });
        if (result && result.length > 0) {
            const updatedRole = yield (0, db_1.default)('SELECT * FROM roles WHERE id=@id', { id });
            res.status(200).json({ message: 'Role updated successfully', role: updatedRole === null || updatedRole === void 0 ? void 0 : updatedRole[0] });
        }
        else {
            res.status(404).json({ message: 'Role not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateRole = updateRole;
// Delete a role
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)(`DELETE FROM roles WHERE id=@id`, { id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Roles deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Roles not found' });
        }
    }
    catch (err) {
        console.error('Error deleting roles:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleController.js.map