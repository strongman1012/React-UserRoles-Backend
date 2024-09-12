import { Request, Response, NextFunction } from 'express';
import sql from '../config/db';

export const checkPermission = (area_name: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const tokenData: any = req.user;
        const auth = tokenData.user;
        const roleIdsArray = auth.role_ids.split(',').map((id: string) => parseInt(id, 10));

        try {
            let isAuthorized = false;

            // Generate SQL placeholders for role_ids
            const rolePlaceholders = roleIdsArray.map((_: any, index: number) => `@role_id${index}`).join(',');
            const roleParameters = roleIdsArray.reduce((acc: any, id: number, index: number) => {
                acc[`role_id${index}`] = id;
                return acc;
            }, {} as { [key: string]: number });

            // Check for 'System Administrator' role
            const roleResult = await sql(
                `SELECT name FROM roles WHERE id IN (${rolePlaceholders})`,
                roleParameters
            );

            if (roleResult && roleResult.length > 0) {
                const roleNames = roleResult.map((role: any) => role.name);
                if (roleNames.includes('System Administrator')) {
                    isAuthorized = true;
                }
            }

            if (!isAuthorized) {
                // Get area id
                const areaResult = await sql('SELECT id FROM areas WHERE name = @area_name', { area_name });
                if (areaResult && areaResult.length > 0) {
                    const area_id = areaResult[0].id;

                    // Check permissions for each role
                    const permissionResult = await sql(
                        `SELECT permission, level 
                        FROM application_area_lists as lists 
                        LEFT JOIN data_accesses as access ON lists.data_access_id = access.id  
                        WHERE role_id IN (${rolePlaceholders}) AND area_id = @area_id`,
                        { ...roleParameters, area_id }
                    );

                    if (permissionResult && permissionResult.length > 0) {
                        isAuthorized = permissionResult.some((permission: any) =>
                            permission.permission && permission.level < 5 && permission.level >= 1
                        );
                    }
                }
            }

            if (isAuthorized) {
                return next();
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }
        } catch (err) {
            console.error('Error checking permission:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    };
};
