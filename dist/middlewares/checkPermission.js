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
exports.checkPermission = void 0;
const db_1 = __importDefault(require("../config/db"));
const checkPermission = (area_name) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const tokenData = req.user;
        const auth = tokenData.user;
        const roleIdsArray = auth.role_ids.split(',').map((id) => parseInt(id, 10));
        try {
            let isAuthorized = false;
            // Generate SQL placeholders for role_ids
            const rolePlaceholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
            const roleParameters = roleIdsArray.reduce((acc, id, index) => {
                acc[`role_id${index}`] = id;
                return acc;
            }, {});
            // Check for 'System Administrator' role
            const roleResult = yield (0, db_1.default)(`SELECT name FROM roles WHERE id IN (${rolePlaceholders})`, roleParameters);
            if (roleResult && roleResult.length > 0) {
                const roleNames = roleResult.map((role) => role.name);
                if (roleNames.includes('System Administrator')) {
                    isAuthorized = true;
                }
            }
            if (!isAuthorized) {
                // Get area id
                const areaResult = yield (0, db_1.default)('SELECT id FROM areas WHERE name = @area_name', { area_name });
                if (areaResult && areaResult.length > 0) {
                    const area_id = areaResult[0].id;
                    // Check permissions for each role
                    const permissionResult = yield (0, db_1.default)(`SELECT permission, level 
                        FROM application_area_lists as lists 
                        LEFT JOIN data_accesses as access ON lists.data_access_id = access.id  
                        WHERE role_id IN (${rolePlaceholders}) AND area_id = @area_id`, Object.assign(Object.assign({}, roleParameters), { area_id }));
                    if (permissionResult && permissionResult.length > 0) {
                        isAuthorized = permissionResult.some((permission) => permission.permission && permission.level < 5 && permission.level >= 1);
                    }
                }
            }
            if (isAuthorized) {
                return next();
            }
            else {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        catch (err) {
            console.error('Error checking permission:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    });
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=checkPermission.js.map