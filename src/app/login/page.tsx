import { ArrowRight, Shield, UserCog, Wrench, Home, Palmtree, Waves } from "lucide-react";
import Link from "next/link";

import { signIn, signUp, quickDemoSignIn } from "@/app/login/actions";
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

const DEMO_ROLES = [
  {
    role: "admin",
    label: "Administrator",
    name: "Taylor Chen",
    desc: "Full audit log & system administration",
    icon: Shield,
    email: "admin.demo@example.test",
  },
  {
    role: "management",
    label: "Management",
    name: "Alex Morgan",
    desc: "Operations overview & ticket assignment",
    icon: UserCog,
    email: "manager.demo@example.test",
  },
  {
    role: "worker",
    label: "Maintenance Worker",
    name: "Sam Rivera",
    desc: "Assigned tasks & inspection logs",
    icon: Wrench,
    email: "worker.demo@example.test",
  },
  {
    role: "resident",
    label: "Resident Owner",
    name: "Casey Reed",
    desc: "Unit DEMO-A-101 owner & bookings",
    icon: Home,
    email: "resident.demo@example.test",
  },
  {
    role: "guest",
    label: "Resort Guest",
    name: "Jordan Lee",
    desc: "Active stay DEMO-A-204 & amenity bookings",
    icon: Palmtree,
    email: "guest.demo@example.test",
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, mode, success } = await searchParams;
  const configured = isSupabaseConfigured();
  const isSignup = mode === "signup";

  return (
    <main className="login-page">
      <div className="login-card" style={{ width: "min(100%, 460px)" }}>
        <div className="login-brand">
          <span className="brand-mark"><Waves size={22} aria-hidden="true" /></span>
          <span>The Resort <small>TATLISU · NORTH CYPRUS</small></span>
        </div>
        <p className="eyebrow">{isSignup ? "WELCOME TO THE RESORT" : "OPERATIONS ACCESS"}</p>
        <h1>{isSignup ? "Create your guest account" : "Sign in to your workspace"}</h1>
        <p className="muted-copy">
          {isSignup ? "Book amenities, request help, and stay connected." : "Choose a role below for instant demo access, or sign in with credentials."}
        </p>

        {error && errors[error] && (
          <div className="notice notice-error" role="alert">{errors[error]}</div>
        )}
        {success === "check-email" && (
          <div className="notice notice-warn" role="status">
            Account created. Check your email to confirm your address, then sign in.
          </div>
        )}

        {/* 1-Click Demo Roles */}
        {!isSignup && (
          <div className="demo-access-section" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2e4a3d", letterSpacing: "0.5px" }}>
                1-TAP DEMO SIGN-IN
              </span>
              <span style={{ fontSize: 10, color: "#8d9692" }}>5 roles configured</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {DEMO_ROLES.map((item) => {
                const Icon = item.icon;
                return (
                  <form key={item.role} action={quickDemoSignIn}>
                    <input type="hidden" name="role" value={item.role} />
                    <button
                      type="submit"
                      className="demo-role-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        border: "1px solid var(--line, #e2e8e5)",
                        borderRadius: 10,
                        background: "#fafbf9",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            display: "inline-grid",
                            placeItems: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#e8f0ea",
                            color: "#2e4a3d",
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <strong style={{ fontSize: 12, display: "block", color: "#1b2821" }}>
                            {item.label} · {item.name}
                          </strong>
                          <small style={{ fontSize: 10, color: "#78827d", display: "block" }}>
                            {item.desc}
                          </small>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: "#78827d", flexShrink: 0 }} />
                    </button>
                  </form>
                );
              })}
            </div>
            <div
              style={{
                textAlign: "center",
                margin: "18px 0 14px",
                position: "relative",
              }}
            >
              <hr style={{ border: 0, borderTop: "1px solid var(--line, #e2e8e5)" }} />
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  padding: "0 10px",
                  fontSize: 10,
                  color: "#98a19d",
                  letterSpacing: "0.5px",
                }}
              >
                OR SIGN IN WITH EMAIL
              </span>
            </div>
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
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={isSignup ? "your.email@example.com" : "admin.demo@example.test"}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
            required
          />
          <button className="button button-primary login-button">
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
