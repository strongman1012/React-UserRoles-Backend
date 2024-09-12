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
exports.deleteBusinessUnit = exports.updateBusinessUnit = exports.createBusinessUnit = exports.getBusinessUnit = exports.getAllBusinessUnits = exports.getAllBusinessUnitsList = exports.getChildBusinessUnits = void 0;
const db_1 = __importDefault(require("../config/db"));
const dataAccessController_1 = require("./dataAccessController");
// Get child business units
const getChildBusinessUnits = (parent_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, db_1.default)('SELECT * FROM business_units WHERE parent_id = @parent_id', { parent_id });
    return result;
});
exports.getChildBusinessUnits = getChildBusinessUnits;
// Get all business units list
const getAllBusinessUnitsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT * FROM business_units');
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Error fetching businessUnits:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllBusinessUnitsList = getAllBusinessUnitsList;
// Get all business units
const getAllBusinessUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Business Units");
        const businessUnits = yield (0, db_1.default)('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id');
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
            editable = false;
        }
        else if (userAccessLevel === 3 || userAccessLevel === 4) {
            result = businessUnits.filter(business => { return business.id === auth.business_unit_id; });
            editable = false;
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
        const userAccessLevel = yield (0, dataAccessController_1.getAreaAccessLevel)(auth.role_ids, "Business Units");
        let editable;
        if (userAccessLevel === 1)
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
    const { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region } = req.body;
    const is_root = false;
    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = yield (0, db_1.default)('INSERT INTO business_units (name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, is_root) VALUES (@name, @parent_id, @admin_id, @website, @mainPhone, @otherPhone, @fax, @email, @street1, @street2, @street3, @city, @state, @zipCode, @region, @is_root)', { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, is_root });
        if (result && result.length > 0) {
            const insertedBusinessUnit = yield (0, db_1.default)('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id ORDER BY business_1.id DESC');
            res.status(201).json({ message: 'Business unit created successfully', businessUnit: insertedBusinessUnit === null || insertedBusinessUnit === void 0 ? void 0 : insertedBusinessUnit[0] });
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
    const { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = yield (0, db_1.default)('UPDATE business_units SET name = @name, parent_id = @parent_id, admin_id = @admin_id, website = @website, mainPhone = @mainPhone, otherPhone = @otherPhone, fax = @fax, email = @email, street1 = @street1, street2 = @street2, street3 = @street3, city = @city, state = @state, zipCode = @zipCode, region = @region WHERE id = @id', { id, name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region });
        if (result && result.length > 0) {
            const updatedBusinessUnit = yield (0, db_1.default)('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id WHERE business_1.id = @id', { id });
            res.status(200).json({ businessUnit: updatedBusinessUnit === null || updatedBusinessUnit === void 0 ? void 0 : updatedBusinessUnit[0], message: 'Business unit updated successfully' });
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
const deleteBusinessUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)(`DELETE FROM business_units WHERE id=@id AND is_root=0`, { id });
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
exports.deleteBusinessUnit = deleteBusinessUnit;
//# sourceMappingURL=businessUnitController.js.map