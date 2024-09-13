import e, { Request, Response } from 'express';
import { Application, AreaList } from '../config/types';
import { getAreaAccessLevel } from './dataAccessController';
import sql from '../config/db';
import { getSetting } from './settingController';

// GetUsersAccess for given roles
export const getUserAccess = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    const role_ids = auth.role_ids;

    try {
        // Fetch all applications
        const applications: Application[] = await sql(`SELECT * FROM applications`) || [];

        // Convert role_ids string to an array of integers
        const roleIdsArray = role_ids ? role_ids.split(',').map((id: string) => parseInt(id, 10)) : [];

        // Generate SQL placeholders for role_ids
        const placeholders = roleIdsArray.map((_: any, index: number) => `@role_id${index}`).join(',');
        const parameters = roleIdsArray.reduce((acc: any, id: number, index: number) => ({ ...acc, [`role_id${index}`]: id }), {});

        // Fetch application area lists for the given roles
        const areaLists: AreaList[] = await sql(
            `SELECT DISTINCT lists.id, role_id, area_id, permission, data_access_id,
                applications.name AS application_name, areas.name AS area_name, level
            FROM application_area_lists AS lists 
            LEFT JOIN areas ON lists.area_id = areas.id 
            LEFT JOIN applications ON areas.application_id = applications.id
            LEFT JOIN data_accesses ON lists.data_access_id = data_accesses.id  
            WHERE role_id IN (${placeholders}) AND permission = 1 
            ORDER BY area_id`,
            parameters
        ) || [];

        // Remove duplicates by area_id and application_name
        const uniqueAreaLists = areaLists.reduce((acc, current) => {
            const x = acc.find(item => item.area_id === current.area_id && item.application_name === current.application_name);
            if (!x) {
                acc.push(current);
            }
            return acc;
        }, [] as AreaList[]);

        // Group results by application_name
        const result = await Promise.all(applications.map(async (application) => {
            const applicationData = uniqueAreaLists.filter(item => item.application_name === application.name);

            let hasPermission = false;
            const applicationId = application.id;
            for (const roleId of roleIdsArray) {
                const permissionResult = await sql(
                    "SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId",
                    { roleId, applicationId }
                );
                if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
                    hasPermission = true;
                    break;
                }
            }
            return {
                application_name: application.name,
                application_id: application.id,
                application_url: application.url,
                permission: hasPermission,
                data: applicationData
            };
        }));

        const setting = await getSetting(auth.id);

        // Send the result as the response
        res.status(200).json({ application_areas: result, setting: setting });
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
        const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Security Roles");
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
                if (item.level === 1)
                    return { ...item, read: true, create: true, update: true, delete: true };
                else
                    return { ...item, read: true, create: false, update: false, delete: false };
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
                    if (item.level === 1)
                        return { ...item, read: true, create: true, update: true, delete: true };
                    else
                        return { ...item, read: true, create: false, update: false, delete: false };
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

// getApplicationRoles about a given role
export const getApplicationRoles = async (req: Request, res: Response) => {
    const { role_id } = req.params;
    const result = await sql(`SELECT * FROM application_roles WHERE role_id=@role_id`, { role_id });
    res.status(200).json(result);
}

// saveApplicationRoles about a given role
export const saveApplicationRoles = async (req: Request, res: Response) => {
    const { role_id, application_id, permission } = req.body;
    // Check if the entry already exists
    const existingEntry = await sql(
        "SELECT id FROM application_roles WHERE role_id=@role_id AND application_id=@application_id",
        { role_id, application_id }
    );
    let result;
    if (existingEntry && existingEntry.length > 0) {
        const updateQuery = await sql(`UPDATE application_roles SET permission=@permission WHERE id=@id`, { permission, id: existingEntry[0].id }); // update applicatino_roles table
        if (updateQuery && updateQuery.length > 0) {
            result = await sql(`SELECT * FROM application_roles WHERE id=@id`, { id: existingEntry[0].id });
        }

    } else {
        // Insert a new entry
        const insertQuery = await sql(`INSERT INTO application_roles (role_id, application_id, permission) VALUES (@role_id, @application_id, @permission)`, { role_id, application_id, permission });
        if (insertQuery && insertQuery.length > 0) {
            result = await sql(`SELECT * FROM application_roles ORDER BY id DESC`);
        }
    }
    res.status(200).json(result);
}