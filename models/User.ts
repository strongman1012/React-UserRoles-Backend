import bcrypt from 'bcryptjs';
import sql from '../config/db'; // Import your SQL module
import { UserAttributes } from '../config/types';

class User implements UserAttributes {
  public id!: number;
  public userName!: string;
  public email!: string;
  public password!: string;
  public status!: boolean | undefined;

  constructor({ id, userName, email, password, status }: UserAttributes) {
    this.id = id;
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.status = status;
  }

  public async validPassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error('Error validating password');
    }
  }

  public static async findByEmail(email: string): Promise<any> {
    const result = await sql("SELECT * FROM users WHERE email=@user", { user: email });
    if (result && result.length > 0) {
      return new result[0];
    }
    return null;
  }

  public static async findById(id: number): Promise<User | null> {
    const result = await sql("SELECT * FROM users WHERE id=@id", { id });
    if (result && result.length > 0) {
      return new User(result[0]);
    }
    return null;
  }

  public static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      console.error('Error in bcrypt operations:', error);
      throw new Error('Error hashing password');
    }
  }
}

export default User;
