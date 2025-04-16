// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user? : {id: string,role: string};
      userId?: string | JwtPayload; // Add userId property
      cookies: { [key: string]: string }; // Ensure cookies are correctly typed
    }
  }
}
