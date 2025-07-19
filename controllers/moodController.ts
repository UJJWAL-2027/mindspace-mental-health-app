import { supabase } from "../lib/supabaseClient";

export async function createMood(userId: string, mood: string) {
  return await supabase
    .from("moods")
    .insert([{ mood, user_id: userId }]);
}

export async function getMoods(userId: string) {
  return await supabase
    .from("moods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}