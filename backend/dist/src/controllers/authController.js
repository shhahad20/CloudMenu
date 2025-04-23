import { supabase, adminSupabase } from '../config/supabaseClient.js';
export const signup = async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    // 1) Create the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
    });
    if (signUpError) {
        return res.status(400).json({ error: signUpError.message });
    }
    const userId = signUpData.user?.id;
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
export const signin = async (req, res) => {
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
