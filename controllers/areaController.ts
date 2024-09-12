import { Request, Response } from 'express';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';

// Get all areas
export const getAllAreas = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Areas");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT areas.*, applications.name application_name FROM areas LEFT JOIN applications ON areas.application_id=applications.id');
        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching areas:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific area by ID
export const getArea = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Areas");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM areas WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
        } else {
            res.status(404).json({ message: 'Area not found' });
        }
    } catch (err) {
        console.error('Error fetching area:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new area
export const createArea = async (req: Request, res: Response) => {
    const { name, description, application_id } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Area name is required" });
    }
    if (!application_id) {
        return res.status(400).json({ message: "Application Id is required" });
    }
    try {
        const result = await sql('INSERT INTO areas (name, description, application_id) VALUES (@name, @description, @application_id)', { name, description, application_id });

        if (result && result.length > 0) {
            const insertedArea = await sql('SELECT areas.*, applications.name application_name FROM areas LEFT JOIN applications ON areas.application_id=applications.id ORDER BY areas.id DESC');
            res.status(201).json({ message: 'Area created successfully', area: insertedArea?.[0] });
        } else {
            res.status(400).json({ message: 'Error creating area' });
        }
    } catch (err) {
        console.error('Error creating area:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing area
export const updateArea = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, application_id } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Area name is required" });
    }
    if (!application_id) {
        return res.status(400).json({ message: "Application is required" });
    }
    try {
        const result = await sql('UPDATE areas SET name = @name, description = @description, application_id = @application_id WHERE id = @id', { id, name, description, application_id });

        if (result && result.length > 0) {
            const updatedArea = await sql('SELECT areas.*, applications.name application_name FROM areas LEFT JOIN applications ON areas.application_id=applications.id WHERE areas.id=@id', { id });
            res.status(200).json({ message: 'Area updated successfully', area: updatedArea?.[0] });
        } else {
            res.status(404).json({ message: 'Area not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating area:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete area
export const deleteArea = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql(`DELETE FROM areas WHERE id=@id`, { id });

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Areas deleted successfully' });
        } else {
            res.status(404).json({ message: 'Areas not found' });
        }
    } catch (err) {
        console.error('Error deleting areas:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
