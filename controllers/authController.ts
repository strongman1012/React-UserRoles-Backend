import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../config/jwt';
import sql from '../config/db';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createLoginReport } from '../controllers/loginReportController';
import { getUserAreas } from './areaListController';
import { getSetting } from './settingController';

// Helper function to create a new user
async function createUser(userName: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await User.hashPassword(password);
    const status = true;
    const result = await sql(
      "INSERT INTO users (userName, email, password, status) OUTPUT INSERTED.* VALUES (@userName, @email, @password, @status)",
      { userName, email, password: hashedPassword, status }
    );

    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  } catch (err) {
    console.error('Error creating user:', err);
    return null;
  }
}

export const register = async (req: Request, res: Response) => {
  const { userName, email, password } = req.body;

  if (!userName) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const newUser = await createUser(userName, email, password);
    if (!newUser) {
      return res.status(500).json({ message: "Error creating user" });
    }
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const user = req.user as InstanceType<typeof User>; // Correctly type the user
  const { application } = req.body;
  const date = new Date().toISOString();

  // Fetch the user from the database
  const result = await sql("SELECT * FROM users WHERE email=@user", { user: user.email });

  if (!result || result.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  // Get user's role IDs
  const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string

  // Check if the application exists and fetch its ID
  const applicationResult = await sql(
    "SELECT id FROM applications WHERE name=@application",
    { application }
  );

  if (!applicationResult || applicationResult.length === 0) {
    return res.status(400).json({ message: "Application not found" });
  }
  const applicationId = applicationResult[0].id;
  // Check if any of the user's roles have permission for this application
  let hasPermission = false;

  for (const roleId of role_ids) {
    const permissionResult = await sql(
      "SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId",
      { roleId, applicationId }
    );
    if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
      hasPermission = true;
      break;
    }
  }
  // Respond based on permission
  if (hasPermission) {
    const userAreas = await getUserAreas(result[0].role_ids);
    const setting = await getSetting(result[0].id);
    const token = await generateToken(result[0]);
    createLoginReport(user.id, date, "Login", application, true, token);
    return res.json({ token, message: "Login successful", userAreas, setting });
  } else {
    createLoginReport(user.id, date, "Login", application, false, null);
    return res.status(403).json({ message: "You don’t have permission to access this application" });
  }
};

// login by token
export const loginWithToken = async (req: Request, res: Response) => {
  const { token, application } = req.body;
  if (token) {
    const decoded = jwt.decode(token);
    const user = (decoded as JwtPayload)?.user;
    const date = new Date().toISOString();

    // Fetch the user from the database
    const result = await sql("SELECT * FROM users WHERE email=@user", { user: user.email });

    if (!result || result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // Get user's role IDs
    const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string

    // Check if the application exists and fetch its ID
    const applicationResult = await sql(
      "SELECT id FROM applications WHERE name=@application",
      { application }
    );

    if (!applicationResult || applicationResult.length === 0) {
      return res.status(400).json({ message: "Application not found" });
    }
    const applicationId = applicationResult[0].id;
    // Check if any of the user's roles have permission for this application
    let hasPermission = false;

    for (const roleId of role_ids) {
      const permissionResult = await sql(
        "SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId",
        { roleId, applicationId }
      );
      if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
        hasPermission = true;
        break;
      }
    }
    // Respond based on permission
    if (hasPermission) {
      const userAreas = await getUserAreas(result[0].role_ids);
      const setting = await getSetting(result[0].id);
      const token = await generateToken(result[0]);
      createLoginReport(user.id, date, "Login", application, true, token);
      return res.json({ token, message: "Login successful", userAreas, setting });
    } else {
      createLoginReport(user.id, date, "Login", application, false, null);
      return res.status(403).json({ message: "You don’t have permission to access this application" });
    }
  }
};

export const azureAdLogin = async (req: Request, res: Response) => {
  const user = req.user as InstanceType<typeof User>; // Correctly type the user
  const { application } = req.body;
  const date = new Date().toISOString();

  // Fetch the user from the database
  const result = await sql("SELECT * FROM users WHERE email=@user", { user: user.email });

  if (!result || result.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  // Get user's role IDs
  const role_ids = result[0].role_ids.split(','); // Assuming role_ids are stored as a comma-separated string

  // Check if the application exists and fetch its ID
  const applicationResult = await sql(
    "SELECT id FROM applications WHERE name=@application",
    { application }
  );

  if (!applicationResult || applicationResult.length === 0) {
    return res.status(400).json({ message: "Application not found" });
  }
  const applicationId = applicationResult[0].id;
  // Check if any of the user's roles have permission for this application
  let hasPermission = false;

  for (const roleId of role_ids) {
    const permissionResult = await sql(
      "SELECT permission FROM application_roles WHERE role_id=@roleId AND application_id=@applicationId",
      { roleId, applicationId }
    );
    if (permissionResult && permissionResult.length > 0 && permissionResult[0].permission) {
      hasPermission = true;
      break;
    }
  }
  // Respond based on permission
  if (hasPermission) {
    const userAreas = await getUserAreas(result[0].role_ids);
    const setting = await getSetting(result[0].id);
    const token = await generateToken(result[0]);
    createLoginReport(user.id, date, "Login", application, true, token);
    return res.json({ token, message: "Login successful", userAreas, setting });
  } else {
    createLoginReport(user.id, date, "Login", application, false, null);
    return res.status(403).json({ message: "You don’t have permission to access this application" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const { application } = req.body;
  if (token) {
    const decoded = jwt.decode(token);
    const auth = (decoded as JwtPayload)?.user;
    // Current timestamp
    const date = new Date();
    const login_session = await sql("SELECT * FROM login_reports WHERE token=@token", { token });
    const login_time = new Date(login_session?.[0].date);
    // Calculate the difference in minutes
    const diffInMinutes = Math.floor((date.getTime() - login_time.getTime()) / 60000);
    // If the difference is greater than 60, set the duration to 60
    const duration = diffInMinutes > 60 ? 60 : diffInMinutes;
    const real_logout_time = new Date(login_time.getTime() + duration * 60000).toISOString();
    const result = await sql("UPDATE login_reports SET usage_time=@usage_time WHERE token=@token", { usage_time: duration, token });
    if (result && result.length > 0) {
      createLoginReport(auth.id, real_logout_time, "Logout", application, true, null);
      res.status(200).json({ message: 'Logout successful' });
    }
  }
};
