import { supabase } from "../lib/supabaseClient";

export async function createJournal(userId: string, entry: string) {
  return await supabase
    .from("journals")
    .insert([{ entry, user_id: userId }]);
}

export async function getJournals(userId: string) {
  return await supabase
    .from("journals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}