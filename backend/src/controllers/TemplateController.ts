import { Request, Response } from 'express';
import { adminSupabase, supabase } from '../config/supabaseClient.js';
import { AuthRequest } from '../middleware/verifyAuth.js';
import { handleUpload } from '../helper/helper.js';


// GET /templates
export const listUserTemplates = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { data, error } = await supabase
    .from('menu_templates')
    .select('*')
    .eq('user_id', userId);
  if (error) return res.status(400).json({ error:error.message });
  res.json(data);
};

export const listLibraryTemplates = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('library_templates')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getLibraryTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('library_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};
// POST /templates
export const createTemplate = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { config } = req.body as { config: any };

    // 1) optionally upload and inject into config
    const imageUrl = await handleUpload(req.file);
    const finalConfig = {
      ...config,
      ...(imageUrl ? { headerImageUrl: imageUrl } : {})
    };

    // 2) insert into DB
    const { data, error } = await supabase
      .from('menu_templates')
      .insert([{ user_id: userId, config: finalConfig }])
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /templates/:id
export const getTemplate = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const templateId = req.params.id;

  // Fetch only this user’s copy
  const { data, error } = await adminSupabase
    .from("menu_templates")
    .select("*")
    .eq("id", templateId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Template not found." });
  }

  // Respond with the full template row
  return res.json(data);
};

// PATCH /templates/:id
export const updateTemplate = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response
) => {
  try {
    const templateId = req.params.id;
    const userId     = req.user!.id;

    // 1) Fetch existing config
    const { data: existing, error: fetchErr } = await adminSupabase
      .from('menu_templates')
      .select('config')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      console.error('Fetch template error:', fetchErr);
      return res.status(404).json({ error: 'Template not found.' });
    }

    // 2) Upload new image if present
    let newConfig = { ...existing.config };
    if (req.file) {
      try {
        const imageUrl = await handleUpload(req.file, templateId);
        newConfig.header_image = imageUrl;
      } catch (uploadErr) {
        console.error('handleUpload error:', uploadErr);
        return res.status(500).json({ error: 'Image upload failed: ' + (uploadErr as Error).message });
      }
    } else {
      console.log('No file in request; skipping upload.');
    }

    // 3) Persist the merged JSON
    const { data, error: updateErr } = await adminSupabase
      .from('menu_templates')
      .update({ config: newConfig, updated_at: 'now()' })
      .eq('id', templateId)
      .single();

    if (updateErr) {
      console.error('Supabase update error:', updateErr);
      return res.status(500).json({ error: 'DB update failed: ' + updateErr.message });
    }
    return res.json(data);

  } catch (err: any) {
    console.error('Unexpected controller error:', err);
    return res.status(500).json({ error: err.message });
  }
};


// DELETE /templates/:id
export const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('menu_templates')
    .delete().eq('id', id);
  if (error) return res.status(400).json({ error:error.message });
  res.json({ message: 'Template deleted.' });
};

// POST /templates/clone/:libraryId
export const cloneTemplate = async (req: AuthRequest, res: Response) => {
  const userId    = req.user!.id;
  const libraryId = req.params.libraryId;

  // 1) fetch the library config
  const { data: lib, error: libErr } = await supabase
    .from('library_templates')
    .select('config, name,preview_url')
    .eq('id', libraryId)
    .single();
  if (libErr) return res.status(404).json({ error: libErr.message });

  // 2) insert into user templates
  const { data, error } = await supabase
    .from('menu_templates')
    .insert([{
      user_id:     userId,
      library_id:  libraryId,
      name:        lib.name,
      preview_url: lib.preview_url,
      config:      lib.config
    }])
    .single();
  if (error) return res.status(400).json({ error: error.message });

  return res.json(data);
};
