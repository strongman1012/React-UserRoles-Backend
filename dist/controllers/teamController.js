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
exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeam = exports.getAllTeams = exports.getAllTeamsList = void 0;
const db_1 = __importDefault(require("../config/db"));
const dataAccessController_1 = require("./dataAccessController");
const businessUnitController_1 = require("./businessUnitController");
// Get all teams list
const getAllTeamsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT * FROM teams');
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllTeamsList = getAllTeamsList;
// Get all teams
const getAllTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Teams");
        const teams = yield (0, db_1.default)('SELECT teams.*, business_units.name AS business_name FROM teams LEFT JOIN business_units ON teams.business_unit_id = business_units.id');
        if (!teams) {
            return res.status(400).json({ message: 'Invalid teams' });
        }
        let result;
        let editable;
        if (userAccessLevel === 1) {
            // Full access to all teams
            result = teams;
            editable = true;
        }
        else if (userAccessLevel === 2) {
            // Access to teams in the same business unit, child business units, and those assigned to auth.team_ids
            const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id) => parseInt(id, 10)) : [];
            const childBusinessUnits = yield (0, businessUnitController_1.getChildBusinessUnits)(auth.business_unit_id);
            const parentData = teams.filter(team => team.business_unit_id === auth.business_unit_id);
            let childrenData = [];
            childBusinessUnits === null || childBusinessUnits === void 0 ? void 0 : childBusinessUnits.forEach(child => {
                const teamsInChildBusinessUnit = teams.filter(team => team.business_unit_id === child.id);
                childrenData = childrenData.concat(teamsInChildBusinessUnit);
            });
            result = parentData.concat(childrenData).concat(teams.filter(team => authTeamIds.includes(team.id)));
            result = Array.from(new Set(result)); // Remove duplicates
            editable = false;
        }
        else if (userAccessLevel === 3) {
            // Access to teams in the same business unit or teams assigned to auth.team_ids
            const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id) => parseInt(id, 10)) : [];
            result = teams.filter(team => team.business_unit_id === auth.business_unit_id || authTeamIds.includes(team.id));
            editable = false;
        }
        else if (userAccessLevel === 4 || userAccessLevel === 5) {
            // Access to teams based on user's assigned team IDs
            const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id) => parseInt(id, 10)) : [];
            result = teams.filter(team => authTeamIds.includes(team.id));
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
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Teams");
        let editable;
        if (userAccessLevel === 1)
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
    const { name, description, business_unit_id, is_default, ids } = req.body;
    const role_ids = null;
    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
    }
    try {
        // Insert new team
        const result = yield (0, db_1.default)('INSERT INTO teams (name, description, business_unit_id, is_default, role_ids) VALUES (@name, @description, @business_unit_id, @is_default, @role_ids)', { name, description, business_unit_id, is_default, role_ids });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            const insertedTeam = yield (0, db_1.default)('SELECT teams.*, business_units.name AS business_name FROM teams LEFT JOIN business_units ON teams.business_unit_id = business_units.id ORDER BY teams.id DESC');
            const insertedId = insertedTeam === null || insertedTeam === void 0 ? void 0 : insertedTeam[0].id;
            // Update team_ids for users in ids array
            if (Array.isArray(ids) && ids.length > 0) {
                const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
                const idsParameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
                yield (0, db_1.default)(`UPDATE users
                     SET team_ids = 
                        CASE
                            WHEN team_ids IS NULL OR team_ids = '' THEN CAST(@team_id AS VARCHAR)
                            ELSE CONCAT(team_ids, ',', CAST(@team_id AS VARCHAR))
                        END
                     WHERE id IN (${idsPlaceholders})`, Object.assign({ team_id: insertedId.toString() }, idsParameters));
            }
            res.status(201).json({ message: 'Team created successfully', team: insertedTeam === null || insertedTeam === void 0 ? void 0 : insertedTeam[0] });
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
    const { name, description, business_unit_id, is_default, role_ids, ids, removeIds } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
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
        if (is_default !== undefined) {
            fieldsToUpdate.push("is_default=@is_default");
            parameters.is_default = is_default;
        }
        if (role_ids !== undefined) {
            fieldsToUpdate.push("role_ids=@role_ids");
            parameters.role_ids = role_ids;
        }
        if (fieldsToUpdate.length > 0) {
            const updateQuery = `UPDATE teams SET ${fieldsToUpdate.join(', ')} WHERE id=@id`;
            yield (0, db_1.default)(updateQuery, parameters);
        }
        // Update team_ids and role_ids for users in ids array
        if (Array.isArray(ids) && ids.length > 0) {
            for (const userId of ids) {
                // Fetch the current team_ids and role_ids for the user
                const user = yield (0, db_1.default)(`SELECT team_ids, role_ids FROM users WHERE id = @userId`, { userId });
                if (user && user[0]) {
                    let teamIds = user[0].team_ids ? user[0].team_ids.split(',') : [];
                    let userRoleIds = user[0].role_ids ? user[0].role_ids.split(',') : [];
                    if (!teamIds.includes(id)) {
                        teamIds.push(id); // Add the new team_id if not already present
                    }
                    // Add role_ids from req.body if not already present
                    if (role_ids) {
                        const newRoleIds = role_ids.split(',').map((roleId) => roleId.trim());
                        for (const roleId of newRoleIds) {
                            if (!userRoleIds.includes(roleId)) {
                                userRoleIds.push(roleId);
                            }
                        }
                    }
                    const updatedTeamIds = teamIds.join(',');
                    const updatedRoleIds = userRoleIds.join(',');
                    yield (0, db_1.default)(`UPDATE users SET team_ids = @updatedTeamIds, role_ids = @updatedRoleIds WHERE id = @userId`, { updatedTeamIds, updatedRoleIds, userId });
                }
            }
        }
        // Remove the team_id from team_ids for users in removeIds array
        if (Array.isArray(removeIds) && removeIds.length > 0) {
            for (const userId of removeIds) {
                // Fetch the current team_ids for the user
                const user = yield (0, db_1.default)(`SELECT team_ids FROM users WHERE id = @userId`, { userId });
                if (user && user[0]) {
                    let teamIds = user[0].team_ids ? user[0].team_ids.split(',') : [];
                    // Remove the team_id if it exists
                    teamIds = teamIds.filter((teamId) => teamId !== id);
                    const updatedTeamIds = teamIds.join(',') || null;
                    yield (0, db_1.default)(`UPDATE users SET team_ids = @updatedTeamIds WHERE id = @userId`, { updatedTeamIds, userId });
                }
            }
        }
        const updatedTeam = yield (0, db_1.default)('SELECT teams.*, business_units.name AS business_name FROM teams LEFT JOIN business_units ON teams.business_unit_id = business_units.id WHERE teams.id = @id', { id });
        res.status(200).json({ message: 'Team updated successfully', team: updatedTeam === null || updatedTeam === void 0 ? void 0 : updatedTeam[0] });
    }
    catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTeam = updateTeam;
// Delete team
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Delete the team
        const result = yield (0, db_1.default)(`DELETE FROM teams WHERE id=@id`, { id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            // Fetch all users to filter and update their team_ids
            const users = yield (0, db_1.default)(`SELECT id, team_ids FROM users`);
            if (users)
                for (const user of users) {
                    let teamIds = user.team_ids ? user.team_ids.split(',').map((id) => parseInt(id, 10)) : [];
                    // Filter out the deleted team IDs from the user's team_ids
                    const originalTeamIds = [...teamIds];
                    teamIds = teamIds.filter((teamId) => teamId !== id);
                    // If the teamIds array is empty, set team_ids to null, otherwise join the remaining ids
                    const updatedTeamIds = teamIds.length > 0 ? teamIds.join(',') : null;
                    // Update the user's team_ids only if they have changed
                    if (originalTeamIds !== teamIds) {
                        yield (0, db_1.default)(`UPDATE users SET team_ids = @updatedTeamIds WHERE id = @userId`, { updatedTeamIds, userId: user.id });
                    }
                }
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