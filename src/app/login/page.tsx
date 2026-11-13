import { ArrowLeft, Waves } from "lucide-react";
import Link from "next/link";

import { signIn } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errors: Record<string, string> = {
  "not-configured": "Connect this app to Supabase before signing in.",
  "missing-fields": "Enter your email and password.",
  "invalid-credentials": "Those credentials could not be verified.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="login-page">
      <div className="login-card">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to demo
        </Link>
        <div className="login-brand">
          <span className="brand-mark"><Waves size={22} aria-hidden="true" /></span>
          <span>The Resort <small>TATLISU · NORTH CYPRUS</small></span>
        </div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your workspace</h1>
        <p className="muted-copy">Your resort operations, all in one place.</p>

        {!configured && (
          <div className="notice notice-warn" role="status">
            Supabase isn&apos;t connected yet. Add the project URL and publishable
            key to <code>.env.local</code> to enable authentication.
          </div>
        )}
        {error && errors[error] && (
          <div className="notice notice-error" role="alert">{errors[error]}</div>
        )}

        <form action={signIn} className="login-form">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required disabled={!configured} />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required disabled={!configured} />
          <button className="button button-primary login-button" disabled={!configured}>
            Sign in
          </button>
        </form>
        <p className="login-footnote">Access is managed by your resort administrator.</p>
      </div>
    </main>
  );
}
