import { ArrowLeft, Waves } from "lucide-react";
import Link from "next/link";

import { signIn, signUp } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; mode?: string; success?: string }>;
};

const errors: Record<string, string> = {
  "not-configured": "Connect this app to Supabase before signing in.",
  "missing-fields": "Enter your email and password.",
  "invalid-credentials": "Those credentials could not be verified.",
  "short-password": "Use a password with at least 8 characters.",
  "signup-failed": "We could not create that account. The email may already be registered.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, mode, success } = await searchParams;
  const configured = isSupabaseConfigured();
  const isSignup = mode === "signup";

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
        <p className="eyebrow">{isSignup ? "WELCOME TO THE RESORT" : "WELCOME BACK"}</p>
        <h1>{isSignup ? "Create your guest account" : "Sign in to your workspace"}</h1>
        <p className="muted-copy">
          {isSignup ? "Book amenities, request help, and stay connected." : "Your resort operations, all in one place."}
        </p>

        {!configured && (
          <div className="notice notice-warn" role="status">
            Supabase isn&apos;t connected yet. Add the project URL and publishable
            key to <code>.env.local</code> to enable authentication.
          </div>
        )}
        {error && errors[error] && (
          <div className="notice notice-error" role="alert">{errors[error]}</div>
        )}
        {success === "check-email" && (
          <div className="notice notice-warn" role="status">
            Account created. Check your email to confirm your address, then sign in.
          </div>
        )}

        <form action={isSignup ? signUp : signIn} className="login-form">
          {isSignup && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required disabled={!configured} />
            </>
          )}
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required disabled={!configured} />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 8 : undefined} required disabled={!configured} />
          <button className="button button-primary login-button" disabled={!configured}>
            {isSignup ? "Create guest account" : "Sign in"}
          </button>
        </form>
        <p className="login-footnote">
          {isSignup ? "Guest access is created automatically. Staff access is managed by your resort administrator." : "New guest? "}
          {!isSignup && <Link href="/login?mode=signup">Create a guest account</Link>}
          {isSignup && <Link href="/login">Already have an account? Sign in</Link>}
        </p>
      </div>
    </main>
  );
}
