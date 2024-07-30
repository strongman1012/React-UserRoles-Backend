import jwt from 'jsonwebtoken';
import config from './config';

interface UserPayload {
  id: number;
  userName: string;
  email: string;
  password: string;
}

export const generateToken = (user: UserPayload) => {
  return jwt.sign(
    { user: user },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
