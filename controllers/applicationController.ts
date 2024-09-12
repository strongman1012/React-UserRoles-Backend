import { Request, Response } from 'express';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';

// Get all applications
export const getAllApplications = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Applications");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM applications');
        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific application by ID
export const getApplication = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Applications");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM applications WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
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
    const { name, url, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Application name is required" });
    }
    try {
        const result = await sql('INSERT INTO applications (name, url, description) VALUES (@name, @url, @description)', { name, url, description });

        if (result && result.length > 0) {
            const insertedApplication = await sql('SELECT * FROM applications ORDER BY id DESC');
            res.status(201).json({ message: 'Application created successfully', application: insertedApplication?.[0] });
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
    const { name, url, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Application name is required" });
    }
    try {
        const result = await sql('UPDATE applications SET name = @name, url = @url, description = @description WHERE id = @id', { id, name, url, description });

        if (result && result.length > 0) {
            const updatedApplication = await sql('SELECT * FROM applications WHERE id=@id', { id });
            res.status(200).json({ message: 'Application updated successfully', application: updatedApplication?.[0] });
        } else {
            res.status(404).json({ message: 'Application not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating application:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete application
export const deleteApplication = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql(`DELETE FROM applications WHERE id=@id`, { id });

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Applications deleted successfully' });
        } else {
            res.status(404).json({ message: 'Applications not found' });
        }
    } catch (err) {
        console.error('Error deleting applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
