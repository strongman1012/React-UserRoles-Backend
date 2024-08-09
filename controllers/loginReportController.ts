import { Request, Response } from 'express';
import sql from '../config/db';

// Create a new login report
export const createLoginReport = async (
    user_id: number,
    date: string,
    type: string,
    application_name: string,
    status: boolean
) => {
    try {
        const result = await sql(
            `INSERT INTO login_reports (user_id, date, type, application_name, status) 
             VALUES (@user_id, @date, @type, @application_name, @status)`,
            {
                user_id,
                date,
                type,
                application_name,
                status
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
                users.userName
            FROM 
                login_reports 
            LEFT JOIN 
                users ON login_reports.user_id = users.id 
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
            ORDER BY 
                MIN(date) ASC;
        `, { user_id });
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching login reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
};