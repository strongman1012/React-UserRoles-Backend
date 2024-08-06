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
exports.deleteTeams = exports.updateTeam = exports.createTeam = exports.getTeam = exports.getAllTeams = void 0;
const db_1 = __importDefault(require("../config/db"));
const dataAccessController_1 = require("./dataAccessController");
const businessUnitController_1 = require("./businessUnitController");
// Get all teams
const getAllTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Teams");
        const teams = yield (0, db_1.default)('SELECT teams.*, users.userName AS admin_name, business_units.name AS business_name FROM teams LEFT JOIN users ON teams.admin_id = users.id LEFT JOIN business_units ON teams.business_unit_id = business_units.id');
        if (!teams)
            return res.status(400).json({ message: 'Invalid teams' });
        let result;
        let editable;
        if (userAccessLevel === 1) {
            result = teams;
            editable = true;
        }
        else if (userAccessLevel === 2) {
            const childBusinessUnits = yield (0, businessUnitController_1.getChildBusinessUnits)(auth.business_unit_id);
            const parentData = teams.filter(team => { return team.business_unit_id === auth.business_unit_id; });
            let childrenData = [];
            childBusinessUnits === null || childBusinessUnits === void 0 ? void 0 : childBusinessUnits.forEach(child => {
                const teamsInChildBusinessUnit = teams.filter(team => { return team.business_unit_id === child.id; });
                childrenData = childrenData.concat(teamsInChildBusinessUnit);
            });
            result = parentData.concat(childrenData);
            editable = true;
        }
        else if (userAccessLevel === 3) {
            result = teams.filter(team => { return team.business_unit_id === auth.business_unit_id; });
            editable = true;
        }
        else if (userAccessLevel === 4) {
            result = teams.filter(team => { return team.id === auth.team_id; });
            editable = true;
        }
        else if (userAccessLevel === 5) {
            result = teams.filter(team => { return team.id === auth.team_id; });
            editable = false;
        }
        else {
            return res.status(400).json({ message: 'Invalid access level' });
        }
        res.status(200).json({ result: result, editable: editable });
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
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Teams");
        let editable;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM teams WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
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
    const { name, description, business_unit_id, admin_id, is_default, ids } = req.body;
    const role_id = null;
    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
    }
    if (!admin_id) {
        return res.status(400).json({ message: "Team administrator is required." });
    }
    try {
        // Insert new team
        const result = yield (0, db_1.default)('INSERT INTO teams (name, description, business_unit_id, admin_id, is_default, role_id) VALUES (@name, @description, @business_unit_id, @admin_id, @is_default, @role_id)', { name, description, business_unit_id, admin_id, is_default, role_id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            const insertedTeam = yield (0, db_1.default)('SELECT id FROM teams ORDER BY id DESC');
            const insertedId = insertedTeam === null || insertedTeam === void 0 ? void 0 : insertedTeam[0].id;
            // Update team_id for users in ids array
            if (Array.isArray(ids) && ids.length > 0) {
                const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
                const idsParameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
                yield (0, db_1.default)(`UPDATE users SET team_id = @team_id WHERE id IN (${idsPlaceholders})`, Object.assign({ team_id: insertedId }, idsParameters));
            }
            res.status(201).json({ message: 'Team created successfully' });
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
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, business_unit_id, admin_id, is_default, role_id, ids, removeIds } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
    }
    if (!admin_id) {
        return res.status(400).json({ message: "Team administrator is required." });
    }
    try {
        // Construct the dynamic update query
        const fieldsToUpdate = [];
        const parameters = { id };
        if (name !== undefined) {
            fieldsToUpdate.push("name=@name");
            parameters.name = name;
        }
        if (description !== undefined) {
            fieldsToUpdate.push("description=@description");
            parameters.description = description;
        }
        if (business_unit_id !== undefined) {
            fieldsToUpdate.push("business_unit_id=@business_unit_id");
            parameters.business_unit_id = business_unit_id;
        }
        if (admin_id !== undefined) {
            fieldsToUpdate.push("admin_id=@admin_id");
            parameters.admin_id = admin_id;
        }
        if (is_default !== undefined) {
            fieldsToUpdate.push("is_default=@is_default");
            parameters.is_default = is_default;
        }
        if (role_id !== undefined) {
            fieldsToUpdate.push("role_id=@role_id");
            parameters.role_id = role_id;
        }
        if (fieldsToUpdate.length > 0) {
            const updateQuery = `UPDATE teams SET ${fieldsToUpdate.join(', ')} WHERE id=@id`;
            yield (0, db_1.default)(updateQuery, parameters);
        }
        // Update team_id and role_id for users in ids array
        if (Array.isArray(ids) && ids.length > 0) {
            const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
            const idsParameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
            yield (0, db_1.default)(`UPDATE users SET team_id = @team_id${role_id !== undefined ? ', role_id = @role_id' : ''} WHERE id IN (${idsPlaceholders})`, Object.assign(Object.assign({ team_id: id }, (role_id !== undefined && { role_id })), idsParameters));
        }
        // Set team_id to null for users in removeIds array
        if (Array.isArray(removeIds) && removeIds.length > 0) {
            const removeIdsPlaceholders = removeIds.map((_, index) => `@removeId${index}`).join(',');
            const removeIdsParameters = removeIds.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`removeId${index}`]: id })), {});
            yield (0, db_1.default)(`UPDATE users SET team_id = NULL WHERE id IN (${removeIdsPlaceholders})`, Object.assign({}, removeIdsParameters));
        }
        res.status(200).json({ message: 'Team updated successfully' });
    }
    catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTeam = updateTeam;
// Delete a teams
const deleteTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.deleteTeams = deleteTeams;
//# sourceMappingURL=teamController.js.map