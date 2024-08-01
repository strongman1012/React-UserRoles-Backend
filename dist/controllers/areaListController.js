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
exports.saveList = exports.getAllList = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all area lists for a given role
const getAllList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id } = req.body;
    try {
        const result = yield (0, db_1.default)(`SELECT lists.id id, role_id, area_id, permission, data_access_id,
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id
             LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
             WHERE role_id=@role_id`, { role_id });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching area lists:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllList = getAllList;
// Save a new area list or update if it exists
const saveList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id, area_id, permission, data_access_id } = req.body;
    const create_data_access_id = 7;
    try {
        // Check if the entry already exists
        const existingEntry = yield (0, db_1.default)("SELECT id FROM application_area_lists WHERE role_id=@role_id AND area_id=@area_id", { role_id, area_id });
        let result;
        if (existingEntry && existingEntry.length > 0) {
            // Construct the dynamic update query
            const fieldsToUpdate = [];
            const parameters = { role_id, area_id };
            if (permission !== undefined) {
                fieldsToUpdate.push("permission=@permission");
                parameters.permission = permission;
            }
            if (data_access_id !== undefined) {
                fieldsToUpdate.push("data_access_id=@data_access_id");
                parameters.data_access_id = data_access_id;
            }
            if (fieldsToUpdate.length > 0) {
                const updateQuery = `UPDATE application_area_lists SET ${fieldsToUpdate.join(', ')} WHERE role_id=@role_id AND area_id=@area_id`;
                result = yield (0, db_1.default)(updateQuery, parameters);
            }
        }
        else {
            // Insert a new entry
            result = yield (0, db_1.default)("INSERT INTO application_area_lists (role_id, area_id, permission, data_access_id) VALUES (@role_id, @area_id, @permission, @data_access_id)", { role_id, area_id, permission: permission !== undefined ? permission : false, data_access_id: data_access_id !== undefined ? data_access_id : create_data_access_id });
        }
        // Fetch the updated list
        const updatedResult = yield (0, db_1.default)(`SELECT lists.id id, role_id, area_id, permission, data_access_id,
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id
             LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
             WHERE role_id=@role_id`, { role_id });
        res.status(200).json(updatedResult);
    }
    catch (err) {
        console.error('Error saving area list:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.saveList = saveList;
//# sourceMappingURL=areaListController.js.map