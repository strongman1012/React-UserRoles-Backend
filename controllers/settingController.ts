import { Request, Response } from 'express';
import sql from '../config/db';

// Get setting by user_id
export const getSetting = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    const user_id = auth.id;
    try {
        const result = await sql('SELECT * FROM settings WHERE user_id = @user_id', { user_id });

        if (result && result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Setting not found' });
        }
    } catch (err) {
        console.error('Error fetching setting:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save or update setting (create if not exists, update if exists)
export const saveSetting = async (req: Request, res: Response) => {
    const tokenData: any = req.user;
    const auth = tokenData.user;
    const user_id = auth.id;
    const { rowsPerPage } = req.body;

    if (rowsPerPage === undefined) {
        return res.status(400).json({ message: "rowsPerPage are required." });
    }

    try {
        // Check if setting already exists for the user
        const existingSetting = await sql('SELECT * FROM settings WHERE user_id = @user_id', { user_id });

        if (existingSetting && existingSetting.length > 0) {
            // Update existing setting
            await sql('UPDATE settings SET rowsPerPage = @rowsPerPage WHERE user_id = @user_id', { user_id, rowsPerPage });
            const updatedSetting = await sql('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
            res.status(200).json({ message: 'Setting updated successfully', setting: updatedSetting?.[0] });
        } else {
            // Create new setting
            await sql('INSERT INTO settings (user_id, rowsPerPage) VALUES (@user_id, @rowsPerPage)', { user_id, rowsPerPage });
            const newSetting = await sql('SELECT * FROM settings WHERE user_id = @user_id', { user_id });
            res.status(201).json({ message: 'Setting created successfully', setting: newSetting?.[0] });
        }
    } catch (err) {
        console.error('Error saving setting:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
