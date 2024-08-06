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
exports.deleteBusinessUnits = exports.updateBusinessUnit = exports.createBusinessUnit = exports.getBusinessUnit = exports.getAllBusinessUnits = exports.getChildBusinessUnits = void 0;
const db_1 = __importDefault(require("../config/db"));
const dataAccessController_1 = require("./dataAccessController");
// Get child business units
const getChildBusinessUnits = (parent_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, db_1.default)('SELECT * FROM business_units WHERE parent_id = @parent_id', { parent_id });
    return result;
});
exports.getChildBusinessUnits = getChildBusinessUnits;
// Get all business units
const getAllBusinessUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Business Units");
        const businessUnits = yield (0, db_1.default)('SELECT business_1.*, business_2.name parent_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id');
        if (!businessUnits)
            return res.status(400).json({ message: 'Invalid businessUnits' });
        let result;
        let editable;
        if (userAccessLevel === 1) {
            result = businessUnits;
            editable = true;
        }
        else if (userAccessLevel === 2) {
            const parentBusinessUnit = businessUnits.filter(business => business.id === auth.business_unit_id);
            const childBusinessUnit = businessUnits.filter(business => business.parent_id === auth.business_unit_id);
            result = parentBusinessUnit.concat(childBusinessUnit);
            editable = true;
        }
        else if (userAccessLevel === 3 || userAccessLevel === 4) {
            result = businessUnits.filter(business => { return business.id === auth.business_unit_id; });
            editable = true;
        }
        else if (userAccessLevel === 5) {
            result = businessUnits.filter(business => { return business.id === auth.business_unit_id; });
            editable = false;
        }
        else {
            return res.status(400).json({ message: 'Invalid access level' });
        }
        res.status(200).json({ result: result, editable: editable });
    }
    catch (err) {
        console.error('Error fetching business units:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllBusinessUnits = getAllBusinessUnits;
// Get a specific business unit by ID
const getBusinessUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_id, "Business Units");
        let editable;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = yield (0, db_1.default)('SELECT * FROM business_units WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        }
        else {
            res.status(404).json({ message: 'Business unit not found' });
        }
    }
    catch (err) {
        console.error('Error fetching business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBusinessUnit = getBusinessUnit;
// Create a new business unit
const createBusinessUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status } = req.body;
    const is_root = false;
    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO business_units (name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status, is_root) VALUES (@name, @parent_id, @website, @mainPhone, @otherPhone, @fax, @email, @street1, @street2, @street3, @city, @state, @zipCode, @region, @status, @is_root)', { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status, is_root });
        if (result && result.length > 0) {
            res.status(201).json({ message: 'Business unit created successfully', businessUnit: result[0] });
        }
        else {
            res.status(400).json({ message: 'Error creating business unit' });
        }
    }
    catch (err) {
        console.error('Error creating business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createBusinessUnit = createBusinessUnit;
// Update an existing business unit
const updateBusinessUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE business_units SET name = @name, parent_id = @parent_id, website = @website, mainPhone = @mainPhone, otherPhone = @otherPhone, fax = @fax, email = @email, street1 = @street1, street2 = @street2, street3 = @street3, city = @city, state = @state, zipCode = @zipCode, region = @region, status = @status WHERE id = @id', { id, name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status });
        if (result && result.length > 0) {
            res.status(200).json({ message: 'Business unit updated successfully' });
        }
        else {
            res.status(404).json({ message: 'Business unit not found or no changes made' });
        }
    }
    catch (err) {
        console.error('Error updating business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateBusinessUnit = updateBusinessUnit;
// Delete a business unit
const deleteBusinessUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }
    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => (Object.assign(Object.assign({}, acc), { [`id${index}`]: id })), {});
        const result = yield (0, db_1.default)(`DELETE FROM business_units WHERE id IN (${placeholders}) AND is_root=0`, parameters);
        if ((result === null || result === void 0 ? void 0 : result[0]) > 0) {
            res.status(200).json({ message: 'Business units deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Business units not found' });
        }
    }
    catch (err) {
        console.error('Error deleting business units:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteBusinessUnits = deleteBusinessUnits;
//# sourceMappingURL=businessUnitController.js.map