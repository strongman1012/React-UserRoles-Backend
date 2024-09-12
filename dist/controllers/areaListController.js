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
exports.saveApplicationRoles = exports.getApplicationRoles = exports.saveList = exports.getSelectedAreas = exports.getUserAreas = void 0;
const dataAccessController_1 = require("./dataAccessController");
const db_1 = __importDefault(require("../config/db"));
// GetUsersAreas for given roles
const getUserAreas = (role_ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all applications
        const applications = (yield (0, db_1.default)(`SELECT * FROM applications`)) || [];
        // Convert role_ids string to an array of integers
        const roleIdsArray = role_ids.split(',').map((id) => parseInt(id, 10));
        // Generate SQL placeholders for role_ids
        const placeholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
        const parameters = roleIdsArray.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`role_id${index}`]: id })), {});
        // Fetch application area lists for the given roles
        const areaLists = (yield (0, db_1.default)(`SELECT DISTINCT lists.id, role_id, area_id, permission, data_access_id,
                applications.name AS application_name, areas.name AS area_name, level
            FROM application_area_lists AS lists 
            LEFT JOIN areas ON lists.area_id = areas.id 
            LEFT JOIN applications ON areas.application_id = applications.id
            LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
            WHERE role_id IN (${placeholders}) AND permission = 1 
            ORDER BY area_id`, parameters)) || [];
        // Remove duplicates by area_id and application_name
        const uniqueAreaLists = areaLists.reduce((acc, current) => {
            const x = acc.find(item => item.area_id === current.area_id && item.application_name === current.application_name);
            if (!x) {
                acc.push(current);
            }
            return acc;
        }, []);
        // Group results by application_name
        const result = yield Promise.all(applications.map((application) => __awaiter(void 0, void 0, void 0, function* () {
            const applicationData = uniqueAreaLists.filter(item => item.application_name === application.name);
            let hasPermission = false;
            const applicationId = application.id;
            for (const roleId of roleIdsArray) {
                const permissionResult = yield (0, db_1.default)("SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId", { roleId, applicationId });
                if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
                    hasPermission = true;
                    break;
                }
            }
            return {
                application_name: application.name,
                application_id: application.id,
                permission: hasPermission,
                data: applicationData
            };
        })));
        return result;
    }
    catch (err) {
        console.error('Error fetching area lists:', err);
        return [{
                application_name: '',
                application_id: '',
                permission: false,
                data: []
            }];
    }
});
exports.getUserAreas = getUserAreas;
// getSelectedAreas for a given role
const getSelectedAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Security Roles");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        // Fetch applications
        const applications = (yield (0, db_1.default)(`SELECT * FROM applications`)) || [];
        // Fetch application area lists
        const areaLists = (yield (0, db_1.default)(`SELECT lists.id id, role_id, area_id, permission, data_access_id,
              applications.name application_name, areas.name area_name, level 
                FROM application_area_lists as lists 
                LEFT JOIN areas ON lists.area_id = areas.id 
                LEFT JOIN applications ON areas.application_id = applications.id
                LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
                WHERE role_id=@role_id`, { role_id })) || [];
        // Group results by application_name
        const result = applications.map(application => {
            const applicationData = areaLists.filter(item => item.application_name === application.name).map(item => {
                if (item.level === 1)
                    return Object.assign(Object.assign({}, item), { read: true, create: true, update: true, delete: true });
                else
                    return Object.assign(Object.assign({}, item), { read: true, create: false, update: false, delete: false });
            });
            return {
                application_name: application.name,
                application_id: application.id,
                data: applicationData
            };
        });
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching area lists:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSelectedAreas = getSelectedAreas;
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
        if (result && result.length > 0) { // Fetch applications
            const applications = (yield (0, db_1.default)(`SELECT * FROM applications`)) || [];
            // Fetch application area lists
            const areaLists = (yield (0, db_1.default)(`SELECT lists.id id, role_id, area_id, permission, data_access_id,
              applications.name application_name, areas.name area_name, level 
                FROM application_area_lists as lists 
                LEFT JOIN areas ON lists.area_id = areas.id 
                LEFT JOIN applications ON areas.application_id = applications.id
                LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
                WHERE role_id=@role_id`, { role_id })) || [];
            // Group results by application_name
            const updatedResult = applications.map(application => {
                const applicationData = areaLists.filter(item => item.application_name === application.name).map(item => {
                    if (item.level === 1)
                        return Object.assign(Object.assign({}, item), { read: true, create: true, update: true, delete: true });
                    else
                        return Object.assign(Object.assign({}, item), { read: true, create: false, update: false, delete: false });
                });
                return {
                    application_name: application.name,
                    application_id: application.id,
                    data: applicationData
                };
            });
            res.status(200).json(updatedResult);
        }
    }
    catch (err) {
        console.error('Error saving area list:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.saveList = saveList;
// getApplicationRoles about a given role
const getApplicationRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id } = req.params;
    const result = yield (0, db_1.default)(`SELECT * FROM application_roles WHERE role_id=@role_id`, { role_id });
    res.status(200).json(result);
});
exports.getApplicationRoles = getApplicationRoles;
// saveApplicationRoles about a given role
const saveApplicationRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role_id, application_id, permission } = req.body;
    // Check if the entry already exists
    const existingEntry = yield (0, db_1.default)("SELECT id FROM application_roles WHERE role_id=@role_id AND application_id=@application_id", { role_id, application_id });
    let result;
    if (existingEntry && existingEntry.length > 0) {
        const updateQuery = yield (0, db_1.default)(`UPDATE application_roles SET permission=@permission WHERE id=@id`, { permission, id: existingEntry[0].id }); // update applicatino_roles table
        if (updateQuery && updateQuery.length > 0) {
            result = yield (0, db_1.default)(`SELECT * FROM application_roles WHERE id=@id`, { id: existingEntry[0].id });
        }
    }
    else {
        // Insert a new entry
        const insertQuery = yield (0, db_1.default)(`INSERT INTO application_roles (role_id, application_id, permission) VALUES (@role_id, @application_id, @permission)`, { role_id, application_id, permission });
        if (insertQuery && insertQuery.length > 0) {
            result = yield (0, db_1.default)(`SELECT * FROM application_roles ORDER BY id DESC`);
        }
    }
    res.status(200).json(result);
});
exports.saveApplicationRoles = saveApplicationRoles;
//# sourceMappingURL=areaListController.js.map