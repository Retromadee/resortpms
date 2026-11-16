import { isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginView } from "@/app/login/login-view";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; mode?: string; success?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, mode, success } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <LoginView
      configured={configured}
      error={error}
      mode={mode}
      success={success}
    />
  );
}
