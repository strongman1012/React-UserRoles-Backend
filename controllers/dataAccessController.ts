import { Request, Response } from 'express';
import sql from '../config/db';

// Get area access level
export const getAreaAccessLevel = async (user_role_id: number, area_name: string) => {
    const result = await sql('SELECT data_accesses.level FROM application_area_lists as lists LEFT JOIN areas ON lists.area_id = areas.id LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id WHERE role_id = @user_role_id AND areas.name = @area_name', { user_role_id, area_name });
    if (result && result.length > 0)
        return result[0].level;
    else
        return 0;
};

// Get all data access records
export const getAllDataAccess = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Data Accesses");
        let editable: boolean;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM data_accesses');
        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching data access records:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific data access record by ID
export const getDataAccess = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Data Accesses");
        let editable: boolean;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM data_accesses WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        } else {
            res.status(404).json({ message: 'Data access record not found' });
        }
    } catch (err) {
        console.error('Error fetching data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new data access record
export const createDataAccess = async (req: Request, res: Response) => {
    const { name, level } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Data Access name is required." });
    }
    if (!level) {
        return res.status(400).json({ message: "Data Access level is required." });
    }
    try {
        const result = await sql(
            'INSERT INTO data_accesses (name, level) VALUES (@name, @level)',
            { name, level }
        );

        if (result) {
            res.status(201).json({ message: 'Data access record created successfully' });
        } else {
            res.status(400).json({ message: 'Error creating data access record' });
        }
    } catch (err) {
        console.error('Error creating data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing data access record
export const updateDataAccess = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, level } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Data Access name is required." });
    }
    if (!level) {
        return res.status(400).json({ message: "Data Access level is required." });
    }
    try {
        const result = await sql(
            'UPDATE data_accesses SET name = @name, level = @level WHERE id = @id',
            { id, name, level }
        );

        if (result) {
            res.status(200).json({ message: 'Data access record updated successfully' });
        } else {
            res.status(404).json({ message: 'Data access record not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating data access record:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a data access record
export const deleteDataAccess = async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }

    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
        const result = await sql(`DELETE FROM data_accesses WHERE id IN (${placeholders})`, parameters);

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Data access records deleted successfully' });
        } else {
            res.status(404).json({ message: 'Data access records not found' });
        }
    } catch (err) {
        console.error('Error deleting data access records:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
