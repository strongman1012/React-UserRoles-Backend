import { Request, Response } from 'express';
import sql from '../config/db';

// Get all business units
export const getAllBusinessUnits = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT business_1.*, business_2.name parent_name FROM business_units business_1 LEFT JOIN business_units business_2 on business_1.parent_id = business_2.id');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching business units:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific business unit by ID
export const getBusinessUnit = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('SELECT * FROM business_units WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json(result[0]);
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
    const { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status } = req.body;

    try {
        const result = await sql(
            'INSERT INTO business_units (name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status) VALUES (@name, @parent_id, @website, @mainPhone, @otherPhone, @fax, @email, @street1, @street2, @street3, @city, @state, @zipCode, @region, @status)',
            { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status }
        );

        if (result && result.length > 0) {
            res.status(201).json({ message: 'Business unit created successfully', businessUnit: result[0] });
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
    const { name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status } = req.body;

    try {
        const result = await sql(
            'UPDATE business_units SET name = @name, parent_id = @parent_id, website = @website, mainPhone = @mainPhone, otherPhone = @otherPhone, fax = @fax, email = @email, street1 = @street1, street2 = @street2, street3 = @street3, city = @city, state = @state, zipCode = @zipCode, region = @region, status = @status WHERE id = @id',
            { id, name, parent_id, website, mainPhone, otherPhone, fax, email, street1, street2, street3, city, state, zipCode, region, status }
        );

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Business unit updated successfully' });
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
        const result = await sql('DELETE FROM business_units WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Business unit deleted successfully' });
        } else {
            res.status(404).json({ message: 'Business unit not found' });
        }
    } catch (err) {
        console.error('Error deleting business unit:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
