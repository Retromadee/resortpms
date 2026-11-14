"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

const DEMO_USERS: Record<string, { role: UserRole; pass: string }> = {
  "admin.demo@example.test": {
    role: "admin",
    pass: process.env.DEMO_ADMIN_PASSWORD || "DemoAdmin123!",
  },
  "manager.demo@example.test": {
    role: "management",
    pass: process.env.DEMO_MANAGER_PASSWORD || "DemoManager123!",
  },
  "worker.demo@example.test": {
    role: "worker",
    pass: process.env.DEMO_WORKER_PASSWORD || "DemoWorker123!",
  },
  "resident.demo@example.test": {
    role: "resident",
    pass: process.env.DEMO_RESIDENT_PASSWORD || "DemoResident123!",
  },
  "guest.demo@example.test": {
    role: "guest",
    pass: process.env.DEMO_GUEST_PASSWORD || "DemoGuest123!",
  },
};

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  // 1. Check if matching demo credentials from .env
  const demoMatch = DEMO_USERS[email];
  if (demoMatch && demoMatch.pass === password) {
    const cookieStore = await cookies();
    cookieStore.set("resort_demo_role", demoMatch.role, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/");
  }

  // 2. Try Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        const cookieStore = await cookies();
        cookieStore.delete("resort_demo_role");
        redirect("/");
      }
    } catch {
      // Fall through to invalid credentials
    }
  }

  redirect("/login?error=invalid-credentials");
}

export async function quickDemoSignIn(formData: FormData) {
  const role = String(formData.get("role") ?? "") as UserRole;
  const validRoles: UserRole[] = ["guest", "resident", "worker", "management", "admin"];

  if (validRoles.includes(role)) {
    const cookieStore = await cookies();
    cookieStore.set("resort_demo_role", role, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/");
  }

  redirect("/login");
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?mode=signup&error=not-configured");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    redirect("/login?mode=signup&error=missing-fields");
  }

  if (password.length < 8) {
    redirect("/login?mode=signup&error=short-password");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect("/login?mode=signup&error=signup-failed");
  }

  if (!data.session) {
    redirect("/login?mode=signup&success=check-email");
  }

  redirect("/");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("resort_demo_role");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors
    }
  }

  redirect("/login");
}
