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
exports.getUserMetrics = exports.getAllLoginReports = exports.createLoginReport = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create a new login report
const createLoginReport = (user_id, date, type, application_name, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`INSERT INTO login_reports (user_id, date, type, application_name, status) 
             VALUES (@user_id, @date, @type, @application_name, @status)`, {
            user_id,
            date,
            type,
            application_name,
            status
        });
        if (result && result.length > 0) {
            return { message: 'Login report created successfully' };
        }
        else {
            throw new Error('Error creating login report');
        }
    }
    catch (err) {
        console.error('Error creating login report:', err);
        throw new Error('Server error');
    }
});
exports.createLoginReport = createLoginReport;
// Get all login reports
const getAllLoginReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`
            SELECT 
                login_reports.*, 
                users.userName
            FROM 
                login_reports 
            LEFT JOIN 
                users ON login_reports.user_id = users.id 
             ORDER BY date DESC
        `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllLoginReports = getAllLoginReports;
const getUserMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const result = yield (0, db_1.default)(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) as login_date, 
                COUNT(*) as login_count
            FROM 
                login_reports
            WHERE 
                user_id = @user_id AND type='Login' AND status=1
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23)
            ORDER BY 
                login_date DESC;
        `, { user_id });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserMetrics = getUserMetrics;
//# sourceMappingURL=loginReportController.js.map