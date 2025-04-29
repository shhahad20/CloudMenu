import { supabase } from '../config/supabaseClient.js';
// GET /templates
export const listUserTemplates = async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from('menu_templates')
        .select('*')
        .eq('user_id', userId);
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
export const listLibraryTemplates = async (_req, res) => {
    const { data, error } = await supabase
        .from('library_templates')
        .select('*');
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
export const getLibraryTemplate = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('library_templates')
        .select('*')
        .eq('id', id)
        .single();
    if (error)
        return res.status(404).json({ error: error.message });
    res.json(data);
};
// POST /templates
export const createTemplate = async (req, res) => {
    // cast body to the right type
    const { config } = req.body;
    const userId = req.user.id;
    // strip out any incoming id
    const templateConfig = { ...config, id: undefined };
    const { data, error } = await supabase
        .from('menu_templates')
        .insert([{ user_id: userId, config: templateConfig }])
        .single();
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
};
// GET /templates/:id
export const getTemplate = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('menu_templates').select('*').eq('id', id).single();
    if (error)
        return res.status(404).json({ error: error.message });
    res.json(data);
};
// PATCH /templates/:id
export const updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { config } = req.body;
    const { data, error } = await supabase
        .from('menu_templates')
        .update({ config, updated_at: 'now()' })
        .eq('id', id)
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
// DELETE /templates/:id
export const deleteTemplate = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('menu_templates')
        .delete().eq('id', id);
    if (error)
        return res.status(400).json({ error: error.message });
    res.json({ message: 'Template deleted.' });
};
// POST /templates/clone/:libraryId
export const cloneTemplate = async (req, res) => {
    const userId = req.user.id;
    const libraryId = req.params.libraryId;
    // 1) fetch the library config
    const { data: lib, error: libErr } = await supabase
        .from('library_templates')
        .select('config, name,preview_url')
        .eq('id', libraryId)
        .single();
    if (libErr)
        return res.status(404).json({ error: libErr.message });
    // 2) insert into user templates
    const { data, error } = await supabase
        .from('menu_templates')
        .insert([{
            user_id: userId,
            library_id: libraryId,
            name: lib.name,
            preview_url: lib.preview_url,
            config: lib.config
        }])
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    return res.json(data);
};
