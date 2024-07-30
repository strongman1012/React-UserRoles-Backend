import { Request, Response } from 'express';
import sql from '../config/db';

// Get all applications
export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT * FROM applications');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific application by ID
export const getApplication = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('SELECT * FROM applications WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (err) {
        console.error('Error fetching application:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new application
export const createApplication = async (req: Request, res: Response) => {
    const { name, description } = req.body;

    try {
        const result = await sql('INSERT INTO applications (name, description) VALUES (@name, @description)', { name, description });

        if (result && result.length > 0) {
            res.status(201).json({ message: 'Application created successfully', application: result[0] });
        } else {
            res.status(400).json({ message: 'Error creating application' });
        }
    } catch (err) {
        console.error('Error creating application:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing application
export const updateApplication = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const result = await sql('UPDATE applications SET name = @name, description = @description WHERE id = @id', { id, name, description });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Application updated successfully' });
        } else {
            res.status(404).json({ message: 'Application not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating application:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an application
export const deleteApplication = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('DELETE FROM applications WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Application deleted successfully' });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (err) {
        console.error('Error deleting application:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
