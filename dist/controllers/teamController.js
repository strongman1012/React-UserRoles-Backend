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
exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeam = exports.getAllTeams = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all teams
const getAllTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT teams.*, users.userName admin_name, business_units.name business_name FROM teams LEFT JOIN users ON teams.admin_id = users.id LEFT JOIN business_units ON teams.business_unit_id = business_units.id');
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllTeams = getAllTeams;
// Get a specific team by ID
const getTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)('SELECT * FROM teams WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json(result[0]);
        }
        else {
            res.status(404).json({ message: 'Team not found' });
        }
    }
    catch (err) {
        console.error('Error fetching team:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTeam = getTeam;
// Create a new team
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, business_unit_id, admin_id, is_default } = req.body;
    try {
        const result = yield (0, db_1.default)('INSERT INTO teams (name, description, business_unit_id, admin_id, is_default) VALUES (@name, @description, @business_unit_id, @admin_id, @is_default)', { name, description, business_unit_id, admin_id, is_default });
        if (result && result.length > 0) {
            res.status(201).json({ message: 'Team created successfully', team: result[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating team' });
        }
    }
    catch (err) {
        console.error('Error creating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createTeam = createTeam;
// Update an existing team
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, business_unit_id, admin_id, is_default } = req.body;
    try {
        const result = yield (0, db_1.default)('UPDATE teams SET name = @name, description = @description, business_unit_id = @business_unit_id, admin_id = @admin_id, is_default = @is_default WHERE id = @id', { id, name, description, business_unit_id, admin_id, is_default });
        if (result && result.length > 0) {
            res.status(200).json({ message: 'Team updated successfully' });
        }
        else {
            res.status(404).json({ message: 'Team not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTeam = updateTeam;
// Delete a team
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }
    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
        const result = yield (0, db_1.default)(`DELETE FROM teams WHERE id IN (${placeholders})`, parameters);
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Teams deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Teams not found' });
        }
    }
    catch (err) {
        console.error('Error deleting teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteTeam = deleteTeam;
//# sourceMappingURL=teamController.js.map