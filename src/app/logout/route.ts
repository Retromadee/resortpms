import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Could not sign out:", error.message);
      return NextResponse.redirect(new URL("/?error=sign-out-failed", request.url), { status: 303 });
    }
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
