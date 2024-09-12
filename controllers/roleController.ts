import { Request, Response } from 'express';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';


// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Roles");
        let editable: boolean;
        if (userAccessLevel === 1)
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
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Roles");
        let editable: boolean;
        if (userAccessLevel === 1)
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
            const insertedRole = await sql('SELECT * FROM roles ORDER BY id DESC');
            res.status(201).json({ message: 'Role created successfully', role: insertedRole?.[0] });
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
            const updatedRole = await sql('SELECT * FROM roles WHERE id=@id', { id });
            res.status(200).json({ message: 'Role updated successfully', role: updatedRole?.[0] });
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
        const result = await sql(`DELETE FROM roles WHERE id=@id`, { id });

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
