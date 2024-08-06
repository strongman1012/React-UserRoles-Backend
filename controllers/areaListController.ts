import { Request, Response } from 'express';
import { Application, AreaList } from '../config/types';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';

// GetUsersAreas for a given role
export const getUserAreas = async (req: Request, res: Response) => {
    const { role_id } = req.params;

    try {
        // Fetch applications
        const applications: Application[] = await sql(`SELECT * FROM applications`) || [];

        // Fetch application area lists
        const areaLists: AreaList[] = await sql(
            `SELECT lists.id id, role_id, area_id, permission, data_access_id,
              applications.name application_name, areas.name area_name, level
                FROM application_area_lists as lists 
                LEFT JOIN areas ON lists.area_id = areas.id 
                LEFT JOIN applications ON areas.application_id = applications.id
                LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
                WHERE role_id=@role_id AND permission=1 ORDER BY area_id`,
            { role_id }
        ) || [];

        // Group results by application_name
        const result = applications.map(application => {
            const applicationData = areaLists.filter(item => item.application_name === application.name);
            return {
                application_name: application.name,
                application_id: application.id,
                data: applicationData
            };
        });

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching area lists:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// getSelectedAreas for a given role
export const getSelectedAreas = async (req: Request, res: Response) => {
    const { role_id } = req.params;
    const tokenData: any = req.user;
    const auth = tokenData.user;
    try {
        const userAccessLevel = await getAreaAccessLevel(auth.role_id, "Security Roles");
        let editable: boolean;
        if (userAccessLevel === 1)
            editable = true;
        else
            editable = false;
        // Fetch applications
        const applications: Application[] = await sql(`SELECT * FROM applications`) || [];

        // Fetch application area lists
        const areaLists: AreaList[] = await sql(
            `SELECT lists.id id, role_id, area_id, permission, data_access_id,
              applications.name application_name, areas.name area_name, level 
                FROM application_area_lists as lists 
                LEFT JOIN areas ON lists.area_id = areas.id 
                LEFT JOIN applications ON areas.application_id = applications.id
                LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
                WHERE role_id=@role_id`,
            { role_id }
        ) || [];

        // Group results by application_name
        const result = applications.map(application => {
            const applicationData = areaLists.filter(item => item.application_name === application.name).map(item => {
                if (item.area_name === "Security Roles") {
                    if (item.level === 1)
                        return { ...item, read: true, create: true, update: true, delete: true };
                    else
                        return { ...item, read: true, create: false, update: false, delete: false };
                }
                else {
                    if (item.level !== 5)
                        return { ...item, read: true, create: true, update: true, delete: true };
                    else
                        return { ...item, read: true, create: false, update: false, delete: false };
                }
            });
            return {
                application_name: application.name,
                application_id: application.id,
                data: applicationData
            };
        });

        res.status(200).json({ result: result, editable: editable });
    } catch (err) {
        console.error('Error fetching area lists:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save a new area list or update if it exists
export const saveList = async (req: Request, res: Response) => {
    const { role_id, area_id, permission, data_access_id } = req.body;
    const create_data_access_id = 7;
    try {
        // Check if the entry already exists
        const existingEntry = await sql(
            "SELECT id FROM application_area_lists WHERE role_id=@role_id AND area_id=@area_id",
            { role_id, area_id }
        );

        let result;
        if (existingEntry && existingEntry.length > 0) {
            // Construct the dynamic update query
            const fieldsToUpdate = [];
            const parameters: any = { role_id, area_id };

            if (permission !== undefined) {
                fieldsToUpdate.push("permission=@permission");
                parameters.permission = permission;
            }
            if (data_access_id !== undefined) {
                fieldsToUpdate.push("data_access_id=@data_access_id");
                parameters.data_access_id = data_access_id;
            }

            if (fieldsToUpdate.length > 0) {
                const updateQuery = `UPDATE application_area_lists SET ${fieldsToUpdate.join(', ')} WHERE role_id=@role_id AND area_id=@area_id`;
                result = await sql(updateQuery, parameters);
            }
        } else {
            // Insert a new entry
            result = await sql(
                "INSERT INTO application_area_lists (role_id, area_id, permission, data_access_id) VALUES (@role_id, @area_id, @permission, @data_access_id)",
                { role_id, area_id, permission: permission !== undefined ? permission : false, data_access_id: data_access_id !== undefined ? data_access_id : create_data_access_id }
            );
        }

        if (result && result.length > 0) {// Fetch applications
            const applications: Application[] = await sql(`SELECT * FROM applications`) || [];

            // Fetch application area lists
            const areaLists: AreaList[] = await sql(
                `SELECT lists.id id, role_id, area_id, permission, data_access_id,
              applications.name application_name, areas.name area_name, level 
                FROM application_area_lists as lists 
                LEFT JOIN areas ON lists.area_id = areas.id 
                LEFT JOIN applications ON areas.application_id = applications.id
                LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
                WHERE role_id=@role_id`,
                { role_id }
            ) || [];

            // Group results by application_name
            const updatedResult = applications.map(application => {
                const applicationData = areaLists.filter(item => item.application_name === application.name).map(item => {
                    if (item.area_name === "Security Roles") {
                        if (item.level === 1)
                            return { ...item, read: true, create: true, update: true, delete: true };
                        else
                            return { ...item, read: true, create: false, update: false, delete: false };
                    }
                    else {
                        if (item.level !== 5)
                            return { ...item, read: true, create: true, update: true, delete: true };
                        else
                            return { ...item, read: true, create: false, update: false, delete: false };
                    }
                });
                return {
                    application_name: application.name,
                    application_id: application.id,
                    data: applicationData
                };
            });

            res.status(200).json(updatedResult);
        }

    } catch (err) {
        console.error('Error saving area list:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
