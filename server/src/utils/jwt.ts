import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/index';

interface JwtPayload {
  uid: string;
  role: string;
  iat: number;
  exp: number;
}

class JWT {
  instance: typeof jsonwebtoken = jsonwebtoken;
  secret: string;

  constructor() {
    this.secret = JWT_SECRET;
  }

  signToken(
    payload: Record<string, any>,
    expiresIn: jsonwebtoken.SignOptions['expiresIn'] = '12h'
  ) {
    const token = this.instance.sign(payload, JWT_SECRET, { expiresIn });

    return token;
  }

  verifyToken(token: string): JwtPayload {
    const auth = this.instance.verify(token, JWT_SECRET) as JwtPayload;
    return auth;
  }
}

export default new JWT();
