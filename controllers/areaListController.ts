import { Request, Response } from 'express';
import sql from '../config/db';

// Get all area lists for a given role
export const getAllList = async (req: Request, res: Response) => {
    const { role_id } = req.body;

    try {
        const result = await sql(
            `SELECT lists.id id, role_id, area_id, permission, data_access_id,
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id
             LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
             WHERE role_id=@role_id`,
            { role_id }
        );

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching area lists:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save a new area list or update if it exists
export const saveList = async (req: Request, res: Response) => {
    const { role_id, area_id, permission, data_access_id } = req.body;
    const create_data_access_id = 7;
    try {
        // Check if the entry already exists
        const existingEntry = await sql(
            "SELECT id FROM application_area_lists WHERE role_id=@role_id AND area_id=@area_id",
            { role_id, area_id }
        );

        let result;
        if (existingEntry && existingEntry.length > 0) {
            // Construct the dynamic update query
            const fieldsToUpdate = [];
            const parameters: any = { role_id, area_id };

            if (permission !== undefined) {
                fieldsToUpdate.push("permission=@permission");
                parameters.permission = permission;
            }
            if (data_access_id !== undefined) {
                fieldsToUpdate.push("data_access_id=@data_access_id");
                parameters.data_access_id = data_access_id;
            }

            if (fieldsToUpdate.length > 0) {
                const updateQuery = `UPDATE application_area_lists SET ${fieldsToUpdate.join(', ')} WHERE role_id=@role_id AND area_id=@area_id`;
                result = await sql(updateQuery, parameters);
            }
        } else {
            // Insert a new entry
            result = await sql(
                "INSERT INTO application_area_lists (role_id, area_id, permission, data_access_id) VALUES (@role_id, @area_id, @permission, @data_access_id)",
                { role_id, area_id, permission: permission !== undefined ? permission : false, data_access_id: data_access_id !== undefined ? data_access_id : create_data_access_id }
            );
        }

        // Fetch the updated list
        const updatedResult = await sql(
            `SELECT lists.id id, role_id, area_id, permission, data_access_id,
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id
             LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
             WHERE role_id=@role_id`,
            { role_id }
        );

        res.status(200).json(updatedResult);
    } catch (err) {
        console.error('Error saving area list:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
