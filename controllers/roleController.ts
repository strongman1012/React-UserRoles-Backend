import { Request, Response } from 'express';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';


// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Roles");
        let editable: boolean;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM roles');
        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific role by ID
export const getRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Roles");
        let editable: boolean;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM roles WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
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

    if (!name) {
        return res.status(400).json({ message: "Role name is required." });
    }
    try {
        const result = await sql('INSERT INTO roles (name) VALUES (@name)', { name });

        if (result && result.length > 0) {
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

    if (!name) {
        return res.status(400).json({ message: "Role name is required." });
    }
    try {
        const result = await sql('UPDATE roles SET name = @name WHERE id = @id', { id, name });

        if (result && result.length > 0) {
            res.status(200).json({ message: 'Role updated successfully' });
        } else {
            res.status(404).json({ message: 'Role not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete roles
export const deleteRoles = async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }

    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
        const result = await sql(`DELETE FROM roles WHERE id IN (${placeholders})`, parameters);

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Roles deleted successfully' });
        } else {
            res.status(404).json({ message: 'Roles not found' });
        }
    } catch (err) {
        console.error('Error deleting roles:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
