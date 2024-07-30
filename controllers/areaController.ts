import { Request, Response } from 'express';
import sql from '../config/db';

// Get all areas
export const getAllAreas = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT * FROM areas');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching areas:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific area by ID
export const getArea = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('SELECT * FROM areas WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json(result[0]);
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

    try {
        const result = await sql('INSERT INTO areas (name, description, application_id) VALUES (@name, @description, @application_id)', { name, description, application_id });

        if (result && result.length > 0) {
            res.status(201).json({ message: 'Area created successfully', area: result[0] });
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

    try {
        const result = await sql('UPDATE areas SET name = @name, description = @description, application_id = @application_id WHERE id = @id', { id, name, description, application_id });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Area updated successfully' });
        } else {
            res.status(404).json({ message: 'Area not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating area:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an area
export const deleteArea = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('DELETE FROM areas WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Area deleted successfully' });
        } else {
            res.status(404).json({ message: 'Area not found' });
        }
    } catch (err) {
        console.error('Error deleting area:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
