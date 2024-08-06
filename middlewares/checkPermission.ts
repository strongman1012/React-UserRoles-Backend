import { Request, Response, NextFunction } from 'express';
import sql from '../config/db';

export const checkPermission = (area_name: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const tokenData: any = req.user;
        const auth = tokenData.user;
        const role_id = auth.role_id;
        try {
            // Get role name
            const roleResult = await sql('SELECT name FROM roles WHERE id = @role_id', { role_id });
            if (!roleResult || roleResult.length === 0) {
                return res.status(403).json({ message: 'Role not found' });
            }

            const roleName = roleResult[0].name;

            let isAuthorized = false;

            // Check for 'System Administrator' role
            if (roleName === 'System Administrator') {
                isAuthorized = true;
            } else {
                // Get area id
                const areaResult = await sql('SELECT id FROM areas WHERE name = @area_name', { area_name });
                if (areaResult && areaResult.length > 0) {
                    const area_id = areaResult[0].id;

                    // Get permission
                    const permissionResult = await sql(
                        'SELECT permission, level FROM application_area_lists as lists LEFT JOIN data_accesses as access ON lists.data_access_id = access.id  WHERE role_id = @role_id AND area_id = @area_id',
                        { role_id, area_id }
                    );

                    if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission && permissionResult[0].level < 5 && permissionResult[0].level >= 1) {
                        isAuthorized = true;
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
