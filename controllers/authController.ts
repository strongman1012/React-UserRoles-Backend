import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../config/jwt';
import sql from '../config/db';

// Helper function to create a new user
async function createUser(userName: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await User.hashPassword(password);
    const result = await sql(
      "INSERT INTO users (userName, email, password) OUTPUT INSERTED.* VALUES (@userName, @email, @password)",
      { userName: userName, email: email, password: hashedPassword }
    );

    if (result && result.length > 0) {
      return new User(result[0]);
    }
    return null;
  } catch (err) {
    console.error('Error creating user:', err);
    return null;
  }
}

export const register = async (req: Request, res: Response) => {
  const userName = req.body.userName as string;
  const email = req.body.email as string;
  const password = req.body.password as string;
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
  const result = await sql("SELECT * FROM users WHERE email=@email", { email: user.email });
  if (!result) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = generateToken(result[0]);
  res.json({ token, message: "Login successful" });
};

export const azureAdLogin = async (req: Request, res: Response) => {
  const user = req.user as InstanceType<typeof User>; // Correctly type the user
  const result = await sql("SELECT * FROM users WHERE email=@email", { email: user.email });
  if (!result) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = generateToken(result[0]);
  res.json({ token, message: "Login successful" });
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful' });
};
