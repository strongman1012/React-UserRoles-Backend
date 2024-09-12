import { Request, Response } from 'express';
import sql from '../config/db';

// Get area access level
export const getAreaAccessLevel = async (user_role_ids: string, area_name: string) => {
    // Convert the comma-separated string of role IDs into an array of integers
    const roleIdsArray = user_role_ids.split(',').map(id => parseInt(id, 10));

    // Construct placeholders for the SQL query
    const placeholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
    const parameters = roleIdsArray.reduce((acc, id, index) => ({ ...acc, [`role_id${index}`]: id }), { area_name });

    const result = await sql(
        `SELECT MIN(data_accesses.level) as min_level 
         FROM application_area_lists as lists 
         LEFT JOIN areas ON lists.area_id = areas.id 
         LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id 
         WHERE role_id IN (${placeholders}) AND areas.name = @area_name`,
        parameters
    );

    if (result && result.length > 0) {
        return result[0].min_level;
    } else {
        return 0;
    }
};

// Get area access level from Applications
export const getApplicationAreaAccessLevel = async (req: Request, res: Response) => {
    const { area_name } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    const role_ids: string = auth.role_ids;
    // Convert the comma-separated string of role IDs into an array of integers
    const roleIdsArray = role_ids.split(',').map(id => parseInt(id, 10));

    // Construct placeholders for the SQL query
    const placeholders = roleIdsArray.map((_, index) => `@role_id${index}`).join(',');
    const parameters = roleIdsArray.reduce((acc, id, index) => ({ ...acc, [`role_id${index}`]: id }), { area_name });

    const result = await sql(
        `SELECT MIN(data_accesses.level) as min_level 
         FROM application_area_lists as lists 
         LEFT JOIN areas ON lists.area_id = areas.id 
         LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id 
         WHERE role_id IN (${placeholders}) AND areas.name = @area_name`,
        parameters
    );

    if (result && result.length > 0) {
        const accessLevel = result[0].min_level;
        return res.status(200).json(accessLevel);
    }

};

// Get all data access records
export const getAllDataAccess = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Data Accesses");
        let editable: boolean;
        if (userAccessLevel === 1)
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
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Data Accesses");
        let editable: boolean;
        if (userAccessLevel === 1)
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
            const insertedDataAccess = await sql('SELECT * FROM data_accesses ORDER BY id DESC');
            res.status(201).json({ message: 'Data access record created successfully', data_access: insertedDataAccess?.[0] });
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
            const updatedDataAccess = await sql('SELECT * FROM data_accesses WHERE id=@id', { id });
            res.status(200).json({ message: 'Data access record updated successfully', data_access: updatedDataAccess?.[0] });
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
    const { id } = req.params;

    try {
        const result = await sql(`DELETE FROM data_accesses WHERE id=@id`, { id });

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
