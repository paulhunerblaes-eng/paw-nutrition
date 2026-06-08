import { supabase } from "./supabase";

export async function getPostLoginRoute(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/auth";

  const { data: plan } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return plan ? "/dashboard" : "/questionnaire";
}
