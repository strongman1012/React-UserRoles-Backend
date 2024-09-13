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
exports.saveSetting = exports.getSetting = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get setting by user_id
const getSetting = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
        if (result && result.length > 0) {
            return result[0];
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        console.error('Error fetching setting:', err);
        return undefined;
    }
});
exports.getSetting = getSetting;
// Save or update setting (create if not exists, update if exists)
const saveSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    const user_id = auth.id;
    const { rowsPerPage } = req.body;
    if (rowsPerPage === undefined) {
        return res.status(400).json({ message: "rowsPerPage are required." });
    }
    try {
        // Check if setting already exists for the user
        const existingSetting = yield (0, db_1.default)('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
        if (existingSetting && existingSetting.length > 0) {
            // Update existing setting
            yield (0, db_1.default)('UPDATE settings SET rowsPerPage = @rowsPerPage WHERE user_id = @user_id', { user_id, rowsPerPage });
            const updatedSetting = yield (0, db_1.default)('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
            res.status(200).json({ message: 'Setting updated successfully', setting: updatedSetting === null || updatedSetting === void 0 ? void 0 : updatedSetting[0] });
        }
        else {
            // Create new setting
            yield (0, db_1.default)('INSERT INTO settings (user_id, rowsPerPage) VALUES (@user_id, @rowsPerPage)', { user_id, rowsPerPage });
            const newSetting = yield (0, db_1.default)('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
            res.status(201).json({ message: 'Setting created successfully', setting: newSetting === null || newSetting === void 0 ? void 0 : newSetting[0] });
        }
    }
    catch (err) {
        console.error('Error saving setting:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.saveSetting = saveSetting;
//# sourceMappingURL=settingController.js.map