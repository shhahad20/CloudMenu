import { adminSupabase } from "../config/supabaseClient.js";
export async function getViewsByDay(req, res) {
    const templateId = req.params.id;
    const { data, error } = await adminSupabase
        .rpc('get_template_views_by_day', { tpl_id: templateId });
    if (error) {
        console.error('Failed to fetch views by day:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
}
