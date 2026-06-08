"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      // 1. Payment success redirect from Stripe — trust it optimistically
      if (window.location.search.includes("payment=success")) {
        localStorage.setItem("petnutri_subscribed", "true");
        window.history.replaceState({}, "", window.location.pathname);
        setChecked(true);
        return;
      }

      // 2. Admin local bypass (petnutri_admin cookie)
      if (document.cookie.includes("petnutri_admin=1")) {
        setChecked(true);
        return;
      }

      // 3. Fast path — localStorage cache
      if (localStorage.getItem("petnutri_subscribed") === "true") {
        setChecked(true);
        return;
      }

      // 4. Check Supabase profiles table
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Middleware handles the auth redirect; nothing to do here
        setChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscribed")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_subscribed) {
        localStorage.setItem("petnutri_subscribed", "true");
        setChecked(true);
      } else {
        router.push("/plan");
      }
    }

    check();
  }, [router]);

  if (!checked) {
    // Invisible while checking — avoids flash of content before redirect
    return null;
  }

  return <>{children}</>;
}
