import { Request, Response } from 'express';
import sql from '../config/db';
import { BusinessUnit } from '../config/types';
import { getAreaAccessLevel } from './dataAccessController';

// Get child business units
export const getChildBusinessUnits = async (parent_id: number) => {
    const result = await sql('SELECT * FROM business_units WHERE parent_id = @parent_id', { parent_id });
    return result;
};

// Get all business units list
export const getAllBusinessUnitsList = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT * FROM business_units');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching businessUnits:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all business units
export const getAllBusinessUnits = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Business Units");
        const businessUnits = await sql('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id');

        if (!businessUnits)
            return res.status(400).json({ message: 'Invalid businessUnits' });

        let result: BusinessUnit[];
        let editable: boolean;

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
            result = businessUnits.filter(business => { return business.id === auth.business_unit_id });
            editable = false;
        }
        else if (userAccessLevel === 5) {
            result = businessUnits.filter(business => { return business.id === auth.business_unit_id });
            editable = false;
        }
        else {
            return res.status(400).json({ message: 'Invalid access level' });
        }

        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching business units:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific business unit by ID
export const getBusinessUnit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Business Units");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM business_units WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        } else {
            res.status(404).json({ message: 'Business unit not found' });
        }
    } catch (err) {
        console.error('Error fetching business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new business unit
export const createBusinessUnit = async (req: Request, res: Response) => {
    const { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region } = req.body;
    const is_root = false;
    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = await sql(
            'INSERT INTO business_units (name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, is_root) VALUES (@name, @parent_id, @admin_id, @website, @mainPhone, @otherPhone, @fax, @email, @street1, @street2, @street3, @city, @state, @zipCode, @region, @is_root)',
            { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, is_root }
        );

        if (result && result.length > 0) {
            const insertedBusinessUnit = await sql('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id ORDER BY business_1.id DESC');
            res.status(201).json({ message: 'Business unit created successfully', businessUnit: insertedBusinessUnit?.[0] });
        } else {
            res.status(400).json({ message: 'Error creating business unit' });
        }
    } catch (err) {
        console.error('Error creating business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing business unit
export const updateBusinessUnit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Business unit name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Business unit email is required" });
    }
    try {
        const result = await sql(
            'UPDATE business_units SET name = @name, parent_id = @parent_id, admin_id = @admin_id, website = @website, mainPhone = @mainPhone, otherPhone = @otherPhone, fax = @fax, email = @email, street1 = @street1, street2 = @street2, street3 = @street3, city = @city, state = @state, zipCode = @zipCode, region = @region WHERE id = @id',
            { id, name, parent_id, admin_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region }
        );

        if (result && result.length > 0) {
            const updatedBusinessUnit = await sql('SELECT business_1.*, business_2.name parent_name, users.userName admin_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id LEFT JOIN users ON business_1.admin_id = users.id WHERE business_1.id = @id', { id });
            res.status(200).json({ businessUnit: updatedBusinessUnit?.[0], message: 'Business unit updated successfully' });
        } else {
            res.status(404).json({ message: 'Business unit not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a business unit
export const deleteBusinessUnit = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql(`DELETE FROM business_units WHERE id=@id AND is_root=0`, { id });

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Business units deleted successfully' });
        } else {
            res.status(404).json({ message: 'Business units not found' });
        }
    } catch (err) {
        console.error('Error deleting business units:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
