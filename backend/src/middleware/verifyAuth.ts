import { RequestHandler,Request  } from 'express';
import { supabase } from '../config/supabaseClient.js';

export interface AuthRequest<Body = any> extends Request<any, any, Body> {
  user?: { id: string; email: string };
}

export const verifyAuth: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided.' });
    return;                        // <-- no return value
  }

  const token = header.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;                        // <-- no return value
  }

  // attach user to req (you can safely cast later)
  ((req as unknown) as AuthRequest).user = {
    id: data.user.id,
    email: data.user.email!,
  };

  next();
};
