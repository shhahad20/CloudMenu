import { Request, Response } from 'express';
import { supabase, adminSupabase } from '../config/supabaseClient.js';
import 'dotenv/config'
import jwt from 'jsonwebtoken';


export const signup = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // 1) Create the user in Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username },
    emailRedirectTo: `${process.env.BACKEND_URL}/confirm-email`}
  });

  if (signUpError) {
    return res.status(400).json({ error: signUpError.message });
  }
  const userId = signUpData.user?.id!;
  
  // 2) Insert into your own profiles table via service role
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({ id: userId, username });

  if (profileError) {
    console.error('Error inserting profile:', profileError);
    // we don't fail signup for this—profile can be incomplete
  }

  // 3) Success response
  return res.json({
    message: 'Signup successful! Please confirm your email before signing in.'
  });
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // data.session contains the access_token (JWT)
  return res.json({
    message: 'Signin successful!',
    user: data.user,
    access_token: data.session?.access_token,
    expires_in: data.session?.expires_in
  });
};

export const signout = async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token.' });
  }

  const token = header.split(' ')[1];

  try {
    // Admin API approach for token revocation
    const { error } = await supabase.auth.admin.signOut(token);
    
    if (error) throw error;
    
    return res.json({ message: 'Successfully logged out.' });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Logout failed' 
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Step 1: send reset email via Supabase
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.json({ message: 'Password reset email sent.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  const { newPassword } = req.body;

  // 1) Basic validation
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token.' });
  }
  if (!newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: 'New password must be at least 8 characters.' });
  }

  const token = header.split(' ')[1];

  // 2) Decode the recovery JWT (no signature verification needed here)
  const decoded = jwt.decode(token);
  if (
    !decoded ||
    typeof decoded !== 'object' ||
    typeof decoded.sub !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid token payload.' });
  }
  const userId = decoded.sub;

  // 3) Use service-role client to update the user’s password by ID
  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password via admin:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.json({ message: 'Password successfully updated.' });
};

export const confirmEmail = async (req: Request, res: Response) => {
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Confirmed</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 4rem; }
          h1 { color: #6d5bba; }
          a { color: #6d5bba; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>✅ Your email is confirmed!</h1>
        <p>Thanks for verifying your address.</p>
        <p><a href="/">Return to home page</a></p>
      </body>
    </html>
  `);
};