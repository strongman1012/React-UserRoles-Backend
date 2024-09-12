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
exports.deleteDataAccess = exports.updateDataAccess = exports.createDataAccess = exports.getDataAccess = exports.getAllDataAccess = exports.getApplicationAreaAccessLevel = exports.getAreaAccessLevel = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get area access level
const getAreaAccessLevel = (user_role_ids, area_name) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert the comma-separated string of role IDs into an array of integers
    const roleIdsArray = user_role_ids.split(',').map(id => parseInt(id, 10));
    // Construct placeholders for the SQL query
    const placeholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
    const parameters = roleIdsArray.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`role_id${index}`]: id })), { area_name });
    const result = yield (0, db_1.default)(`SELECT MIN(data_accesses.level) as min_level 
         FROM application_area_lists as lists 
         LEFT JOIN areas ON lists.area_id = areas.id 
         LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id 
         WHERE role_id IN (${placeholders}) AND areas.name = @area_name`, parameters);
    if (result && result.length > 0) {
        return result[0].min_level;
    }
    else {
        return 0;
    }
});
exports.getAreaAccessLevel = getAreaAccessLevel;
// Get area access level from Applications
const getApplicationAreaAccessLevel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { area_name } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    const role_ids = auth.role_ids;
    // Convert the comma-separated string of role IDs into an array of integers
    const roleIdsArray = role_ids.split(',').map(id => parseInt(id, 10));
    // Construct placeholders for the SQL query
    const placeholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
    const parameters = roleIdsArray.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`role_id${index}`]: id })), { area_name });
    const result = yield (0, db_1.default)(`SELECT MIN(data_accesses.level) as min_level 
         FROM application_area_lists as lists 
         LEFT JOIN areas ON lists.area_id = areas.id 
         LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id 
         WHERE role_id IN (${placeholders}) AND areas.name = @area_name`, parameters);
    if (result && result.length > 0) {
        const accessLevel = result[0].min_level;
        return res.status(200).json(accessLevel);
    }
});
exports.getApplicationAreaAccessLevel = getApplicationAreaAccessLevel;
// Get all data access records
const getAllDataAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, exports.getAreaAccessLevel)(auth.role_ids, "Data Accesses");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM data_accesses');
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching data access records:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllDataAccess = getAllDataAccess;
// Get a specific data access record by ID
const getDataAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, exports.getAreaAccessLevel)(auth.role_ids, "Data Accesses");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM data_accesses WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        }
        else {
            res.status(404).json({ message: 'Data access record not found' });
        }
    }
    catch (err) {
        console.error('Error fetching data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDataAccess = getDataAccess;
// Create a new data access record
const createDataAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, level } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Data Access name is required." });
    }
    if (!level) {
        return res.status(400).json({ message: "Data Access level is required." });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO data_accesses (name, level) VALUES (@name, @level)', { name, level });
        if (result) {
            const insertedDataAccess = yield (0, db_1.default)('SELECT * FROM data_accesses ORDER BY id DESC');
            res.status(201).json({ message: 'Data access record created successfully', data_access: insertedDataAccess === null || insertedDataAccess === void 0 ? void 0 : insertedDataAccess[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating data access record' });
        }
    }
    catch (err) {
        console.error('Error creating data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createDataAccess = createDataAccess;
// Update an existing data access record
const updateDataAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, level } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Data Access name is required." });
    }
    if (!level) {
        return res.status(400).json({ message: "Data Access level is required." });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE data_accesses SET name = @name, level = @level WHERE id = @id', { id, name, level });
        if (result) {
            const updatedDataAccess = yield (0, db_1.default)('SELECT * FROM data_accesses WHERE id=@id', { id });
            res.status(200).json({ message: 'Data access record updated successfully', data_access: updatedDataAccess === null || updatedDataAccess === void 0 ? void 0 : updatedDataAccess[0] });
        }
        else {
            res.status(404).json({ message: 'Data access record not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateDataAccess = updateDataAccess;
// Delete a data access record
const deleteDataAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)(`DELETE FROM data_accesses WHERE id=@id`, { id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Data access records deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Data access records not found' });
        }
    }
    catch (err) {
        console.error('Error deleting data access records:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteDataAccess = deleteDataAccess;
//# sourceMappingURL=dataAccessController.js.map