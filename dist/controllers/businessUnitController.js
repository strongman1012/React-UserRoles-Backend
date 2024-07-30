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
exports.deleteBusinessUnit = exports.updateBusinessUnit = exports.createBusinessUnit = exports.getBusinessUnit = exports.getAllBusinessUnits = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all business units
const getAllBusinessUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT business_1.*, business_2.name parent_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id');
        res.status(200).json(result);
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
    try {
        const result = yield (0, db_1.default)('SELECT * FROM business_units WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json(result[0]);
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
    try {
        const result = yield (0, db_1.default)('INSERT INTO business_units (name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status) VALUES (@name, @parent_id, @website, @mainPhone, @otherPhone, @fax, @email, @street1, @street2, @street3, @city, @state, @zipCode, @region, @status)', { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status });
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
const deleteBusinessUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, db_1.default)('DELETE FROM business_units WHERE id = @id', { id });
        if (result && result.length > 0) {
            res.status(200).json({ message: 'Business unit deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Business unit not found' });
        }
    }
    catch (err) {
        console.error('Error deleting business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteBusinessUnit = deleteBusinessUnit;
//# sourceMappingURL=businessUnitController.js.map