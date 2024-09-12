import { Request, Response } from 'express';
import User from '../models/User';
import sql from '../config/db';
import { UserAttributes } from '../config/types';
import { getAreaAccessLevel } from './dataAccessController';
import { getChildBusinessUnits } from './businessUnitController';

// Get users list
export const getAllUsersList = async (req: Request, res: Response) => {
  try {
    const result = await sql('SELECT users.*, business_units.name AS business_name FROM users LEFT JOIN business_units ON users.business_unit_id = business_units.id');
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  const tokenData: any = req.user;
  const auth = tokenData.user;

  try {
    const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Users");
    const users = await sql("SELECT users.*, business_units.name AS business_name FROM users LEFT JOIN business_units ON users.business_unit_id = business_units.id");

    if (!users) {
      return res.status(400).json({ message: 'Invalid users' });
    }

    let result: UserAttributes[] = [];
    let editable: boolean = false;

    if (userAccessLevel === 1) {
      // Full access to all users
      result = users;
      editable = true;
    } else if (userAccessLevel === 2) {
      // Access to users in the same business unit, child business units, and those assigned to auth.team_ids
      const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];
      const childBusinessUnits = await getChildBusinessUnits(auth.business_unit_id);
      const usersInParentBusinessUnit = users.filter(user => user.business_unit_id === auth.business_unit_id);
      let usersInChildBusinessUnits: UserAttributes[] = [];

      childBusinessUnits?.forEach(child => {
        const childBusinessUnitUsers = users.filter(user => user.business_unit_id === child.id);
        usersInChildBusinessUnits = usersInChildBusinessUnits.concat(childBusinessUnitUsers);
      });

      const totalUsersInBusinessUnit = usersInParentBusinessUnit.concat(usersInChildBusinessUnits);
      const teamIds = Array.from(new Set(totalUsersInBusinessUnit.flatMap(user => user.team_ids ? user.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [])));

      result = users.filter(user => {
        const userTeamIds = user.team_ids ? user.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];
        return userTeamIds.some((id: number) => teamIds.includes(id)) || userTeamIds.some((id: number) => authTeamIds.includes(id));
      });

      editable = false;
    } else if (userAccessLevel === 3) {
      // Access to users in the same business unit or users assigned to auth.team_ids
      const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];
      const usersInBusinessUnit = users.filter(user => user.business_unit_id === auth.business_unit_id);
      const teamIds = Array.from(new Set(usersInBusinessUnit.flatMap(user => user.team_ids ? user.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [])));

      result = users.filter(user => {
        const userTeamIds = user.team_ids ? user.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];
        return userTeamIds.some((id: number) => teamIds.includes(id)) || userTeamIds.some((id: number) => authTeamIds.includes(id));
      });

      editable = false;
    } else if (userAccessLevel === 4) {
      // Access to users in the same team as the authenticated user
      const authTeamIds = auth.team_ids ? auth.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];

      result = users.filter(user => {
        const userTeamIds = user.team_ids ? user.team_ids.split(',').map((id: string) => parseInt(id, 10)) : [];
        return userTeamIds.some((id: number) => authTeamIds.includes(id));
      });

      editable = false;
    } else if (userAccessLevel === 5) {
      // Access only to the authenticated user's own record
      result = users.filter(user => user.id === auth.id);
      editable = false;
    } else {
      return res.status(400).json({ message: 'Invalid access level' });
    }

    res.status(200).json({ result: result, editable: editable });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a user by ID
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tokenData: any = req.user;
  const auth = tokenData.user;
  try {
    const userAccessLevel = await getAreaAccessLevel(auth.role_ids, "Users");
    let editable: boolean;
    if (userAccessLevel === 1)
      editable = true;
    else
      editable = false;
    const result = await sql("SELECT * FROM users WHERE id=@id", { id });
    if (result && result.length > 0) {
      res.status(200).json({ result: result[0], editable: editable });
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
  const { userName, email, fullName, role_ids, mobilePhone, mainPhone, status, business_unit_id, team_ids } = req.body;
  const password = "12345";
  const hashedPassword = await User.hashPassword(password);

  if (!userName) {
    return res.status(400).json({ message: "Username is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const result = await sql(
      'INSERT INTO users (userName, email, password, fullName, role_ids, mobilePhone, mainPhone, status, business_unit_id, team_ids) VALUES (@userName, @email, @password, @fullName, @role_ids, @mobilePhone, @mainPhone, @status, @business_unit_id, @team_ids)',
      { userName, email, password: hashedPassword, fullName, role_ids, mobilePhone, mainPhone, status, business_unit_id, team_ids }
    );

    if (result && result.length > 0) {
      const insertedUser = await sql('SELECT users.*, business_units.name AS business_name FROM users LEFT JOIN business_units ON users.business_unit_id = business_units.id ORDER BY users.id DESC');
      res.status(201).json({ message: 'An user created successfully', user: insertedUser?.[0] });
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
  const { userName, email, fullName, role_ids, mobilePhone, mainPhone, status, business_unit_id, team_ids } = req.body;

  if (!userName) {
    return res.status(400).json({ message: "Username is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

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
    if (role_ids !== undefined) {
      setClause += 'role_ids=@role_ids, ';
      params.role_ids = role_ids;
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
    if (team_ids !== undefined) {
      setClause += 'team_ids=@team_ids, ';
      params.team_ids = team_ids;
    }

    // Remove the trailing comma and space from the SET clause
    setClause = setClause.slice(0, -2);

    if (!setClause) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const query = `UPDATE users SET ${setClause} WHERE id=@id`;

    const result = await sql(query, params);

    if (result?.[0] > 0) {
      const updatedUser = await sql('SELECT users.*, business_units.name AS business_name FROM users LEFT JOIN business_units ON users.business_unit_id = business_units.id WHERE users.id = @id', { id });
      res.status(200).json({ user: updatedUser?.[0], message: 'User updated successfully' });
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
    const result = await sql(`DELETE FROM users WHERE id=@id`, { id });

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
