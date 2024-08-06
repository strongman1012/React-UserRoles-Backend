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
exports.deleteAreas = exports.updateArea = exports.createArea = exports.getArea = exports.getAllAreas = void 0;
const dataAccessController_1 = require("./dataAccessController");
const db_1 = __importDefault(require("../config/db"));
// Get all areas
const getAllAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Areas");
        let editable;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT areas.*, applications.name application_name FROM areas LEFT JOIN applications ON areas.application_id=applications.id');
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching areas:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllAreas = getAllAreas;
// Get a specific area by ID
const getArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Areas");
        let editable;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM areas WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        }
        else {
            res.status(404).json({ message: 'Area not found' });
        }
    }
    catch (err) {
        console.error('Error fetching area:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getArea = getArea;
// Create a new area
const createArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, application_id } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Area name is required" });
    }
    if (!application_id) {
        return res.status(400).json({ message: "Application Id is required" });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO areas (name, description, application_id) VALUES (@name, @description, @application_id)', { name, description, application_id });
        if (result && result.length > 0) {
            res.status(201).json({ message: 'Area created successfully', area: result[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating area' });
        }
    }
    catch (err) {
        console.error('Error creating area:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createArea = createArea;
// Update an existing area
const updateArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, application_id } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Area name is required" });
    }
    if (!application_id) {
        return res.status(400).json({ message: "Application is required" });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE areas SET name = @name, description = @description, application_id = @application_id WHERE id = @id', { id, name, description, application_id });
        if (result && result.length > 0) {
            res.status(200).json({ message: 'Area updated successfully' });
        }
        else {
            res.status(404).json({ message: 'Area not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating area:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateArea = updateArea;
// Delete areas
const deleteAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }
    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
        const result = yield (0, db_1.default)(`DELETE FROM areas WHERE id IN (${placeholders})`, parameters);
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Areas deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Areas not found' });
        }
    }
    catch (err) {
        console.error('Error deleting areas:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteAreas = deleteAreas;
//# sourceMappingURL=areaController.js.map