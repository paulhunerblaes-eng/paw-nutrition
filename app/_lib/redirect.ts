import { supabase } from "./supabase";

export async function getPostLoginRoute(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/auth";

  const [{ data: plan }, { data: profile }] = await Promise.all([
    supabase.from("plans").select("id").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("is_subscribed").eq("id", user.id).maybeSingle(),
  ]);

  const isSubscribed = (profile as { is_subscribed?: boolean } | null)?.is_subscribed;

  if (isSubscribed) return "/dashboard/plan";
  if (plan) return "/dashboard";
  return "/questionnaire";
}
