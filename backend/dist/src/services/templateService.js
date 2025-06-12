// src/services/templateService.ts
import { adminSupabase, supabase } from '../config/supabaseClient.js';
import { byteSize, planLimits } from '../controllers/TemplateController.js';
export async function cloneTemplateService(libraryId, userId, userPlan) {
    // 1) Validate plan & quotas
    const limits = planLimits[userPlan];
    if (!limits)
        throw new Error(`Invalid plan: ${userPlan}`);
    // a) fetch template
    const { data: lib, error: libErr } = await supabase
        .from('library_templates')
        .select('config,name,preview_url')
        .eq('id', libraryId)
        .single();
    if (libErr || !lib)
        throw new Error('Library template not found.');
    // b) project-count quota
    if (userPlan !== 'Enterprise') {
        const { count, error: cntErr } = await adminSupabase
            .from('menu_templates')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
        if (cntErr)
            throw cntErr;
        if ((count || 0) >= limits.maxProjects) {
            throw new Error(`${userPlan} plan allows up to ${limits.maxProjects} projects.`);
        }
    }
    // c) storage quota
    const { data: rows, error: rowsErr } = await adminSupabase
        .from('menu_templates')
        .select('size_bytes')
        .eq('user_id', userId);
    if (rowsErr)
        throw rowsErr;
    const usedBytes = rows.reduce((sum, r) => sum + (r.size_bytes || 0), 0);
    const { data: files, error: filesErr } = await adminSupabase.storage
        .from('users-menu-images')
        .list(userId, { limit: 1000 });
    if (filesErr)
        throw filesErr;
    const usedFileBytes = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
    const templateBytes = byteSize(lib.config);
    if ((usedBytes + usedFileBytes + templateBytes) > limits.maxStorageMB * 1024 * 1024) {
        throw new Error(`${userPlan} storage limit exceeded.`);
    }
    // 2) Insert cloned record
    const { data: inserted, error: insertErr } = await adminSupabase
        .from('menu_templates')
        .insert([{
            user_id: userId,
            library_id: libraryId,
            name: lib.name,
            preview_url: lib.preview_url,
            config: lib.config,
            size_bytes: templateBytes,
        }])
        .select('id, name, preview_url, config, size_bytes')
        .single();
    if (insertErr || !inserted)
        throw insertErr || new Error('Insert failed');
    return inserted; // you can ignore the returned value in the webhook
}
