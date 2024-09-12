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
exports.deleteApplication = exports.updateApplication = exports.createApplication = exports.getApplication = exports.getAllApplications = void 0;
const dataAccessController_1 = require("./dataAccessController");
const db_1 = __importDefault(require("../config/db"));
// Get all applications
const getAllApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Applications");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM applications');
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllApplications = getAllApplications;
// Get a specific application by ID
const getApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Applications");
        let editable;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM applications WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        }
        else {
            res.status(404).json({ message: 'Application not found' });
        }
    }
    catch (err) {
        console.error('Error fetching application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getApplication = getApplication;
// Create a new application
const createApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, url, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Application name is required" });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO applications (name, url, description) VALUES (@name, @url, @description)', { name, url, description });
        if (result && result.length > 0) {
            const insertedApplication = yield (0, db_1.default)('SELECT * FROM applications ORDER BY id DESC');
            res.status(201).json({ message: 'Application created successfully', application: insertedApplication === null || insertedApplication === void 0 ? void 0 : insertedApplication[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating application' });
        }
    }
    catch (err) {
        console.error('Error creating application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createApplication = createApplication;
// Update an existing application
const updateApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, url, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Application name is required" });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE applications SET name = @name, url = @url, description = @description WHERE id = @id', { id, name, url, description });
        if (result && result.length > 0) {
            const updatedApplication = yield (0, db_1.default)('SELECT * FROM applications WHERE id=@id', { id });
            res.status(200).json({ message: 'Application updated successfully', application: updatedApplication === null || updatedApplication === void 0 ? void 0 : updatedApplication[0] });
        }
        else {
            res.status(404).json({ message: 'Application not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateApplication = updateApplication;
// Delete application
const deleteApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)(`DELETE FROM applications WHERE id=@id`, { id });
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Applications deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Applications not found' });
        }
    }
    catch (err) {
        console.error('Error deleting applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteApplication = deleteApplication;
//# sourceMappingURL=applicationController.js.map