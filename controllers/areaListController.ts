import { Request, Response } from 'express';
import sql from '../config/db';

// Get all area lists for a given role
export const getAllList = async (req: Request, res: Response) => {
    const { role_id } = req.body;

    try {
        const result = await sql(
            `SELECT lists.id id, role_id, area_id, permission, 
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id  
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
    const { role_id, area_id, permission } = req.body;

    try {
        // Check if the entry already exists
        const existingEntry = await sql(
            "SELECT id FROM application_area_lists WHERE role_id=@role_id AND area_id=@area_id",
            { role_id, area_id }
        );

        let result;
        if (existingEntry && existingEntry.length > 0) {
            // Update the existing entry
            result = await sql(
                "UPDATE application_area_lists SET permission=@permission WHERE role_id=@role_id AND area_id=@area_id",
                { role_id, area_id, permission }
            );
        } else {
            // Insert a new entry
            result = await sql(
                "INSERT INTO application_area_lists (role_id, area_id, permission) VALUES (@role_id, @area_id, @permission)",
                { role_id, area_id, permission }
            );
        }

        // Fetch the updated list
        const updatedResult = await sql(
            `SELECT lists.id id, role_id, area_id, permission, 
                    applications.name application_name, areas.name area_name 
             FROM application_area_lists as lists 
             LEFT JOIN areas ON lists.area_id = areas.id 
             LEFT JOIN applications ON areas.application_id = applications.id  
             WHERE role_id=@role_id`,
            { role_id }
        );

        res.status(200).json(updatedResult);
    } catch (err) {
        console.error('Error saving area list:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
