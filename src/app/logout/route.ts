import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("resort_demo_role");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Could not sign out of Supabase:", err);
    }
  }

  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete("resort_demo_role");
  return response;
}
