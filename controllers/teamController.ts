import { Request, Response } from 'express';
import sql from '../config/db';

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
    try {
        const result = await sql('SELECT teams.*, users.userName AS admin_name, business_units.name AS business_name FROM teams LEFT JOIN users ON teams.admin_id = users.id LEFT JOIN business_units ON teams.business_unit_id = business_units.id');
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific team by ID
export const getTeam = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql('SELECT * FROM teams WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Team not found' });
        }
    } catch (err) {
        console.error('Error fetching team:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new team
export const createTeam = async (req: Request, res: Response) => {
    const { name, description, business_unit_id, admin_id, is_default, ids } = req.body;

    try {
        // Insert new team
        const result = await sql(
            'INSERT INTO teams (name, description, business_unit_id, admin_id, is_default) VALUES (@name, @description, @business_unit_id, @admin_id, @is_default)',
            { name, description, business_unit_id, admin_id, is_default }
        );

        if (result?.[0] > 0) {
            const insertedTeam = await sql(
                'SELECT id FROM teams WHERE name=@name AND business_unit_id=@business_unit_id AND admin_id=@admin_id AND is_default=@is_default ORDER BY id DESC LIMIT 1',
                { name, business_unit_id, admin_id, is_default }
            );
            const insertedId = insertedTeam?.[0].id;

            // Update team_id for users in ids array
            if (Array.isArray(ids) && ids.length > 0) {
                const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
                const idsParameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
                await sql(
                    `UPDATE users SET team_id = @team_id WHERE id IN (${idsPlaceholders})`,
                    { team_id: insertedId, ...idsParameters }
                );
            }

            res.status(201).json({ message: 'Team created successfully' });
        } else {
            res.status(400).json({ message: 'Error creating team' });
        }
    } catch (err) {
        console.error('Error creating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing team
export const updateTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, business_unit_id, admin_id, is_default, role_id, ids, removeIds } = req.body;

    try {
        // Update the team details
        const result = await sql(
            'UPDATE teams SET name = @name, description = @description, business_unit_id = @business_unit_id, admin_id = @admin_id, is_default = @is_default WHERE id = @id',
            { id, name, description, business_unit_id, admin_id, is_default }
        );

        // Update team_id and role_id for users in ids array
        if (Array.isArray(ids) && ids.length > 0) {
            const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
            const idsParameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id, role_id }), {});
            await sql(
                `UPDATE users SET team_id = @team_id, role_id = @role_id WHERE id IN (${idsPlaceholders})`,
                { team_id: id, ...idsParameters }
            );
        }

        // Set team_id to null for users in removeIds array
        if (Array.isArray(removeIds) && removeIds.length > 0) {
            const removeIdsPlaceholders = removeIds.map((_, index) => `@removeId${index}`).join(',');
            const removeIdsParameters = removeIds.reduce((acc, id, index) => ({ ...acc, [`removeId${index}`]: id }), {});
            await sql(
                `UPDATE users SET team_id = NULL WHERE id IN (${removeIdsPlaceholders})`,
                { ...removeIdsParameters }
            );
        }

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Team updated successfully' });
        } else {
            res.status(404).json({ message: 'Team not found or no changes made' });
        }
    } catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a team
export const deleteTeam = async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: 'IDs must be an array' });
    }

    try {
        const placeholders = ids.map((id, index) => `@id${index}`).join(',');
        const parameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
        const result = await sql(`DELETE FROM teams WHERE id IN (${placeholders})`, parameters);

        if (result?.[0] > 0) {
            res.status(200).json({ message: 'Teams deleted successfully' });
        } else {
            res.status(404).json({ message: 'Teams not found' });
        }
    } catch (err) {
        console.error('Error deleting teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
