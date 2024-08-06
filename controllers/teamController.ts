import { Request, Response } from 'express';
import sql from '../config/db';
import { Team } from '../config/types';
import { getAreaAccessLevel } from './dataAccessController';
import { getChildBusinessUnits } from './businessUnitController';

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Teams");
        const teams = await sql('SELECT teams.*, users.userName AS admin_name, business_units.name AS business_name FROM teams LEFT JOIN users ON teams.admin_id = users.id LEFT JOIN business_units ON teams.business_unit_id = business_units.id');

        if (!teams)
            return res.status(400).json({ message: 'Invalid teams' });

        let result: Team[];
        let editable: boolean;

        if (userAccessLevel === 1) {
            result = teams;
            editable = true;
        }
        else if (userAccessLevel === 2) {
            const childBusinessUnits = await getChildBusinessUnits(auth.business_unit_id);
            const parentData = teams.filter(team => { return team.business_unit_id === auth.business_unit_id });
            let childrenData: Team[] = [];
            childBusinessUnits?.forEach(child => {
                const teamsInChildBusinessUnit = teams.filter(team => { return team.business_unit_id === child.id });
                childrenData = childrenData.concat(teamsInChildBusinessUnit);
            });
            result = parentData.concat(childrenData);
            editable = true;
        }
        else if (userAccessLevel === 3) {
            result = teams.filter(team => { return team.business_unit_id === auth.business_unit_id });
            editable = true;
        }
        else if (userAccessLevel === 4) {
            result = teams.filter(team => { return team.id === auth.team_id });
            editable = true;
        }
        else if (userAccessLevel === 5) {
            result = teams.filter(team => { return team.id === auth.team_id });
            editable = false;
        }
        else {
            return res.status(400).json({ message: 'Invalid access level' });
        }
        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific team by ID
export const getTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Teams");
        let editable: boolean;
        if (userAccessLevel >= 1 && userAccessLevel < 5)
            editable = true;
        else
            editable = false;
        const result = await sql('SELECT * FROM teams WHERE id = @id', { id });

        if (result && result.length > 0) {
            res.status(200).json({ result: result[0], editable: editable });
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
    const role_id = null;
    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
    }
    if (!admin_id) {
        return res.status(400).json({ message: "Team administrator is required." });
    }
    try {
        // Insert new team
        const result = await sql(
            'INSERT INTO teams (name, description, business_unit_id, admin_id, is_default, role_id) VALUES (@name, @description, @business_unit_id, @admin_id, @is_default, @role_id)',
            { name, description, business_unit_id, admin_id, is_default, role_id }
        );

        if (result?.[0] > 0) {
            const insertedTeam = await sql('SELECT id FROM teams ORDER BY id DESC');
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

export const updateTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, business_unit_id, admin_id, is_default, role_id, ids, removeIds } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Team name is required." });
    }
    if (!business_unit_id) {
        return res.status(400).json({ message: "Business unit is required." });
    }
    if (!admin_id) {
        return res.status(400).json({ message: "Team administrator is required." });
    }
    try {
        // Construct the dynamic update query
        const fieldsToUpdate = [];
        const parameters: any = { id };

        if (name !== undefined) {
            fieldsToUpdate.push("name=@name");
            parameters.name = name;
        }
        if (description !== undefined) {
            fieldsToUpdate.push("description=@description");
            parameters.description = description;
        }
        if (business_unit_id !== undefined) {
            fieldsToUpdate.push("business_unit_id=@business_unit_id");
            parameters.business_unit_id = business_unit_id;
        }
        if (admin_id !== undefined) {
            fieldsToUpdate.push("admin_id=@admin_id");
            parameters.admin_id = admin_id;
        }
        if (is_default !== undefined) {
            fieldsToUpdate.push("is_default=@is_default");
            parameters.is_default = is_default;
        }
        if (role_id !== undefined) {
            fieldsToUpdate.push("role_id=@role_id");
            parameters.role_id = role_id;
        }

        if (fieldsToUpdate.length > 0) {
            const updateQuery = `UPDATE teams SET ${fieldsToUpdate.join(', ')} WHERE id=@id`;
            await sql(updateQuery, parameters);
        }

        // Update team_id and role_id for users in ids array
        if (Array.isArray(ids) && ids.length > 0) {
            const idsPlaceholders = ids.map((_, index) => `@id${index}`).join(',');
            const idsParameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
            await sql(
                `UPDATE users SET team_id = @team_id${role_id !== undefined ? ', role_id = @role_id' : ''} WHERE id IN (${idsPlaceholders})`,
                { team_id: id, ...(role_id !== undefined && { role_id }), ...idsParameters }
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

        res.status(200).json({ message: 'Team updated successfully' });
    } catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a teams
export const deleteTeams = async (req: Request, res: Response) => {
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
