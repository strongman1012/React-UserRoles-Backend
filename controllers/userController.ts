import { Request, Response } from 'express';
import User from '../models/User';
import sql from '../config/db';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await sql("SELECT users.*, roles.name role_name, business_units.name business_name, teams.name team_name  FROM users LEFT JOIN roles ON users.role_id = roles.id LEFT JOIN business_units ON users.business_unit_id = business_units.id LEFT JOIN teams ON users.team_id = teams.id");

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a user by ID
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await sql("SELECT * FROM users WHERE id=@id", { id });
    if (result && result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id } = req.body;
  const password = "12345";
  const hashedPassword = await User.hashPassword(password);
  try {
      const result = await sql(
          'INSERT INTO users (userName, email, password, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id) VALUES (@userName, @email, @password, @fullName, @role_id, @mobilePhone, @mainPhone, @status, @business_unit_id, @team_id)',
          { userName, email, password: hashedPassword, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id }
      );

      if (result && result.length > 0) {
          res.status(201).json({ message: 'An user created successfully', user: result[0] });
      } else {
          res.status(400).json({ message: 'Error creating user' });
      }
  } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ message: 'Server error' });
  }
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id, team_id } = req.body;

  try {
    // Construct the SET clause dynamically
    let setClause = '';
    const params: any = { id };

    if (userName !== undefined) {
      setClause += 'userName=@userName, ';
      params.userName = userName;
    }
    if (email !== undefined) {
      setClause += 'email=@email, ';
      params.email = email;
    }
    if (fullName !== undefined) {
      setClause += 'fullName=@fullName, ';
      params.fullName = fullName;
    }
    if (role_id !== undefined) {
      setClause += 'role_id=@role_id, ';
      params.role_id = role_id;
    }
    if (mobilePhone !== undefined) {
      setClause += 'mobilePhone=@mobilePhone, ';
      params.mobilePhone = mobilePhone;
    }
    if (mainPhone !== undefined) {
      setClause += 'mainPhone=@mainPhone, ';
      params.mainPhone = mainPhone;
    }
    if (status !== undefined) {
      setClause += 'status=@status, ';
      params.status = status;
    }
    if (business_unit_id !== undefined) {
      setClause += 'business_unit_id=@business_unit_id, ';
      params.business_unit_id = business_unit_id;
    }
    if (team_id !== undefined) {
      setClause += 'team_id=@team_id, ';
      params.team_id = team_id;
    }

    // Remove the trailing comma and space from the SET clause
    setClause = setClause.slice(0, -2);

    if (!setClause) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const query = `UPDATE users SET ${setClause} WHERE id=@id`;

    const result = await sql(query, params);

    if (result?.[0] > 0) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete a user by IDs
export const deleteUser = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'IDs must be an array' });
  }

  try {
    const placeholders = ids.map((id, index) => `@id${index}`).join(',');
    const parameters = ids.reduce((acc, id, index) => ({ ...acc, [`id${index}`]: id }), {});
    const result = await sql(`DELETE FROM users WHERE id IN (${placeholders})`, parameters);

    if (result?.[0] > 0) {
      res.status(200).json({ message: 'Users deleted successfully' });
    } else {
      res.status(404).json({ message: 'Users not found' });
    }
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
