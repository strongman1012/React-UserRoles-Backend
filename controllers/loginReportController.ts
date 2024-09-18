import { Request, Response } from 'express';
import sql from '../config/db';

// Create a new login report
export const createLoginReport = async (
    user_id: number,
    date: string,
    type: string,
    application_id: number,
    status: boolean,
    token: string | null
) => {
    try {
        const result = await sql(
            `INSERT INTO login_reports (user_id, date, type, application_id, status, token) 
             VALUES (@user_id, @date, @type, @application_id, @status, @token)`,
            {
                user_id,
                date,
                type,
                application_id,
                status,
                token
            }
        );

        if (result && result.length > 0) {
            return { message: 'Login report created successfully' };
        } else {
            throw new Error('Error creating login report');
        }
    } catch (err) {
        console.error('Error creating login report:', err);
        throw new Error('Server error');
    }
};

// Get all login reports
export const getAllLoginReports = async (req: Request, res: Response) => {
    try {
        const result = await sql(`
            SELECT 
                login_reports.*, 
                users.userName,
                applications.name application_name
            FROM 
                login_reports 
            LEFT JOIN 
                users ON login_reports.user_id = users.id
            LEFT JOIN
                applications ON login_reports.application_id = applications.id 
             ORDER BY date DESC
        `);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserMetrics = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const result = await sql(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) as login_date, 
                COUNT(*) as login_count
            FROM 
                login_reports
            WHERE 
                user_id = @user_id AND type='Login' AND status=1
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23)
        `, { user_id });
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Total Application Usage Per Day (min) 
export const getApplicationPerDayMin = async (req: Request, res: Response) => {
    try {
        const result = await sql(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) AS usage_date,
                application_id,
                SUM(usage_time) AS usage_time
            FROM 
                login_reports
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23),
                application_id
            ORDER BY 
                usage_date ASC,
                application_id ASC
        `);

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching application usage per day (min):', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Total Users Per Day 
export const getApplicationPerDayNumber = async (req: Request, res: Response) => {
    try {
        const result = await sql(`
            SELECT 
                CONVERT(VARCHAR(10), date, 23) AS usage_date,
                application_id,
                COUNT(DISTINCT user_id) AS usage_users
            FROM 
                login_reports
            WHERE 
                status = 1
            GROUP BY 
                CONVERT(VARCHAR(10), date, 23),
                application_id
            ORDER BY 
                usage_date ASC,
                application_id ASC
        `);

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching application users per day:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Total Application Usage (%)
export const getApplicationTotalPercent = async (req: Request, res: Response) => {
    try {
        const result = await sql(`
            SELECT 
                application_id,
                SUM(usage_time) AS total_usage_time,
                RTRIM(CAST(ROUND((SUM(usage_time) * 100.0) / (SELECT SUM(usage_time) FROM login_reports WHERE usage_time IS NOT NULL), 2) AS DECIMAL(10, 2)) + 0.0) AS usage_percent
            FROM 
                login_reports
            WHERE 
                usage_time IS NOT NULL
            GROUP BY 
                application_id
            ORDER BY 
                usage_percent DESC
        `);

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching application total percent:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Number of users under each application
export const getApplicationCategory = async (req: Request, res: Response) => {
    try {
        const roles = await sql(`
            SELECT roles.name role_name, applications.name application_name FROM application_area_lists as list LEFT JOIN roles ON (list.role_id=roles.id)
            LEFT JOIN areas ON (list.area_id=areas.id) LEFT JOIN applications ON (areas.application_id=applications.id) WHERE permission=1
            GROUP BY applications.name, roles.name ORDER BY application_name
        `);
        const users = await sql(`SELECT id, role_ids FROM users`);

        res.status(200).json({ roles: roles, users: users });
    } catch (err) {
        console.error('Error fetching users under each application:', err);
        res.status(500).json({ message: 'Server error' });
    }
}