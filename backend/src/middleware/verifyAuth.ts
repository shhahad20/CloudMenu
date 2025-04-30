import { RequestHandler,Request  } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthRequest<Body = any> extends Request<any, any, Body> {
  user?: { id: string; email: string };
  supabase?: SupabaseClient;
}

export const verifyAuth: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = header.split(' ')[1];

  // Validate token (using your global anon client)
  const { data, error } = await createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  ).auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Attach user info
  const authReq = req as AuthRequest;
  authReq.user = { id: data.user.id, email: data.user.email! };

  // Create a request-scoped Supabase client that carries the JWT
  authReq.supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  next();
};
