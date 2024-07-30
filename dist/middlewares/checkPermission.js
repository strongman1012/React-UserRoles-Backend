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
        const { user_role_id } = req.body;
        const role_id = user_role_id;
        try {
            // Get role name
            const roleResult = yield (0, db_1.default)('SELECT name FROM roles WHERE id = @role_id', { role_id });
            if (!roleResult || roleResult.length === 0) {
                return res.status(403).json({ message: 'Role not found' });
            }
            const roleName = roleResult[0].name;
            let isAuthorized = false;
            // Check for 'System Administrator' role
            if (roleName === 'System Administrator') {
                isAuthorized = true;
            }
            else {
                // Get area id
                const areaResult = yield (0, db_1.default)('SELECT id FROM areas WHERE name = @area_name', { area_name });
                if (areaResult && areaResult.length > 0) {
                    const area_id = areaResult[0].id;
                    // Get permission
                    const permissionResult = yield (0, db_1.default)('SELECT permission FROM application_area_lists WHERE role_id = @role_id AND area_id = @area_id', { role_id, area_id });
                    if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
                        isAuthorized = true;
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