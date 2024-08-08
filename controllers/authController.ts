import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../config/jwt';
import sql from '../config/db';
import { createLoginReport } from '../controllers/loginReportController';

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
  const result = await sql("SELECT * FROM users WHERE email=@user", { user: user.email });
  if (!result || result.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = generateToken(result[0]);
  res.json({ token, message: "Login successful" });
};

export const azureAdLogin = async (req: Request, res: Response) => {
  const user = req.user as InstanceType<typeof User>; // Correctly type the user
  const result = await sql("SELECT * FROM users WHERE email=@user", { user: user.email });
  if (!result || result.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = generateToken(result[0]);
  res.json({ token, message: "Login successful" });
};

export const logout = async (req: Request, res: Response) => {
  const tokenData: any = req.user;
  const auth = tokenData.user;
  // Current timestamp
  const date = new Date().toISOString();
  const { application } = req.body;
  createLoginReport(auth.id, date, "Logout", application, true)
  res.status(200).json({ message: 'Logout successful' });
};
