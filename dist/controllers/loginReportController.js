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
exports.getApplicationCategory = exports.getApplicationTotalPercent = exports.getApplicationPerDayNumber = exports.getApplicationPerDayMin = exports.getUserMetrics = exports.getAllLoginReports = exports.createLoginReport = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create a new login report
const createLoginReport = (user_id, date, type, application_id, status, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`INSERT INTO login_reports (user_id, date, type, application_id, status, token) 
             VALUES (@user_id, @date, @type, @application_id, @status, @token)`, {
            user_id,
            date,
            type,
            application_id,
            status,
            token
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
                users.userName,
                applications.name application_name
            FROM 
                login_reports 
            LEFT JOIN 
                users ON login_reports.user_id = users.id
            LEFT JOIN
                applications ON login_reports.application_id = applications.id 
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
        `, { user_id });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserMetrics = getUserMetrics;
// Total Application Usage Per Day (min) 
const getApplicationPerDayMin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) AS usage_date,
                application_id,
                SUM(usage_time) AS usage_time
            FROM 
                login_reports
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23),
                application_id
            ORDER BY 
                usage_date ASC,
                application_id ASC
        `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching application usage per day (min):', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApplicationPerDayMin = getApplicationPerDayMin;
// Total Users Per Day 
const getApplicationPerDayNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) AS usage_date,
                application_id,
                COUNT(DISTINCT user_id) AS usage_users
            FROM 
                login_reports
            WHERE 
                status = 1
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23),
                application_id
            ORDER BY 
                usage_date ASC,
                application_id ASC
        `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching application users per day:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApplicationPerDayNumber = getApplicationPerDayNumber;
// Total Application Usage (%)
const getApplicationTotalPercent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)(`
            SELECT 
                application_id,
                SUM(usage_time) AS total_usage_time,
                RTRIM(CAST(ROUND((SUM(usage_time) * 100.0) / (SELECT SUM(usage_time) FROM login_reports WHERE usage_time IS NOT NULL), 2) AS DECIMAL(10, 2)) + 0.0) AS usage_percent
            FROM 
                login_reports
            WHERE 
                usage_time IS NOT NULL
            GROUP BY 
                application_id
            ORDER BY 
                usage_percent DESC
        `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching application total percent:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApplicationTotalPercent = getApplicationTotalPercent;
// Number of users under each application
const getApplicationCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield (0, db_1.default)(`
            SELECT roles.name role_name, applications.name application_name FROM application_area_lists as list LEFT JOIN roles ON (list.role_id=roles.id)
            LEFT JOIN areas ON (list.area_id=areas.id) LEFT JOIN applications ON (areas.application_id=applications.id) WHERE permission=1
            GROUP BY applications.name, roles.name ORDER BY application_name
        `);
        const users = yield (0, db_1.default)(`SELECT id, role_ids FROM users`);
        res.status(200).json({ roles: roles, users: users });
    }
    catch (err) {
        console.error('Error fetching users under each application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApplicationCategory = getApplicationCategory;
//# sourceMappingURL=loginReportController.js.map