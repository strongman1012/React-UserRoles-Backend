import { Request, Response } from 'express';
import sql from '../config/db';

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT * FROM roles');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific role by ID
export const getRole = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('SELECT * FROM roles WHERE id = @id', { id });

        if (result && result?.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (err) {
        console.error('Error fetching role:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new role
export const createRole = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const result = await sql('INSERT INTO roles (name) VALUES (@name)', { name });

        if (result && result?.[0] > 0) {
            res.status(201).json({ message: 'Role created successfully', role: result[0] });
        } else {
            res.status(400).json({ message: 'Error creating role' });
        }
    } catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing role
export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const result = await sql('UPDATE roles SET name = @name WHERE id = @id', { id, name });

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Role updated successfully' });
        } else {
            res.status(404).json({ message: 'Role not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a role
export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('DELETE FROM roles WHERE id = @id', { id });

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Role deleted successfully' });
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (err) {
        console.error('Error deleting role:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
