import { Request, Response } from 'express';
import sql from '../config/db';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await sql("SELECT users.*, roles.name role_name, business_units.name business_name  FROM users LEFT JOIN roles ON users.role_id = roles.id LEFT JOIN business_units ON users.business_unit_id = business_units.id");

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


// Update a user by ID
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, email, fullName, role_id, mobilePhone, mainPhone, status, business_unit_id } = req.body;

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


// Delete a user by ID
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await sql("DELETE FROM users WHERE id=@id", { id });

    if (result?.[0] > 0) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
