import { supabase } from './supabase';

// Saved Design Studio documents (table: designs, see supabase/migrations)
const FIELDS = 'id, name, kind, width, height, thumbnail, updated_at';

export async function listDesigns({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('designs')
    .select(FIELDS)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getDesign(id) {
  const { data, error } = await supabase.from('designs').select(`${FIELDS}, data`).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveDesign({ id, userId, name, kind = 'flyer', width, height, data, thumbnail }) {
  const row = { name, kind, width, height, data, thumbnail, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from('designs').update(row).eq('id', id)
    : supabase.from('designs').insert({ ...row, user_id: userId });
  const { data: saved, error } = await query.select(FIELDS).single();
  if (error) throw error;
  return saved;
}

export async function deleteDesign(id) {
  const { error } = await supabase.from('designs').delete().eq('id', id);
  if (error) throw error;
}
