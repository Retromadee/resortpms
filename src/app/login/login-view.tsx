"use client";

import { ArrowRight, Shield, UserCog, Wrench, Home, Palmtree, Waves } from "lucide-react";
import Link from "next/link";

import { signIn, signUp, quickDemoSignIn } from "@/app/login/actions";
import { LanguageSwitcher, useI18n } from "@/components/language-switcher";
import type { Dictionary } from "@/lib/i18n";

type LoginViewProps = {
  configured: boolean;
  error?: string;
  mode?: string;
  success?: string;
};

const errorKeyMap: Record<string, keyof Dictionary> = {
  "not-configured": "errNotConfigured",
  "missing-fields": "errMissingFields",
  "invalid-credentials": "errInvalidCredentials",
  "short-password": "errShortPassword",
  "signup-failed": "errSignupFailed",
};

const DEMO_ROLES = [
  {
    role: "admin",
    labelKey: "demoAdmin" as const,
    name: "Taylor Chen",
    descKey: "demoAdminDesc" as const,
    icon: Shield,
  },
  {
    role: "management",
    labelKey: "demoManagement" as const,
    name: "Alex Morgan",
    descKey: "demoManagementDesc" as const,
    icon: UserCog,
  },
  {
    role: "worker",
    labelKey: "demoWorker" as const,
    name: "Sam Rivera",
    descKey: "demoWorkerDesc" as const,
    icon: Wrench,
  },
  {
    role: "resident",
    labelKey: "demoResident" as const,
    name: "Casey Reed",
    descKey: "demoResidentDesc" as const,
    icon: Home,
  },
  {
    role: "guest",
    labelKey: "demoGuest" as const,
    name: "Jordan Lee",
    descKey: "demoGuestDesc" as const,
    icon: Palmtree,
  },
];

export function LoginView({ configured, error, mode, success }: LoginViewProps) {
  const { t } = useI18n();
  const isSignup = mode === "signup";

  const errorMessage = error && errorKeyMap[error] ? t[errorKeyMap[error]] : null;

  return (
    <main className="login-page">
      <div className="login-card" style={{ width: "min(100%, 460px)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
          <div className="login-brand" style={{ marginBottom: 0 }}>
            <span className="brand-mark"><Waves size={22} aria-hidden="true" /></span>
            <span>{t.resortTitle} <small>{t.resortLocation}</small></span>
          </div>
          <LanguageSwitcher />
        </div>

        <p className="eyebrow">{isSignup ? t.welcomeToResort : t.operationsAccess}</p>
        <h1>{isSignup ? t.createGuestAccount : t.signInToWorkspace}</h1>
        <p className="muted-copy">
          {isSignup ? t.signUpSubtitle : t.signInSubtitle}
        </p>

        {errorMessage && (
          <div className="notice notice-error" role="alert">{errorMessage}</div>
        )}
        {success === "check-email" && (
          <div className="notice notice-warn" role="status">
            {t.errCheckEmail}
          </div>
        )}

        {/* 1-Click Demo Roles */}
        {!isSignup && (
          <div className="demo-access-section" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2e4a3d", letterSpacing: "0.5px" }}>
                {t.oneTapDemo}
              </span>
              <span style={{ fontSize: 11, color: "#8d9692" }}>{t.rolesConfigured}</span>
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
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <strong style={{ fontSize: 13, display: "block", color: "#1b2821" }}>
                            {t[item.labelKey]} · {item.name}
                          </strong>
                          <small style={{ fontSize: 11, color: "#78827d", display: "block" }}>
                            {t[item.descKey]}
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
                {t.orSignInWithEmail}
              </span>
            </div>
          </div>
        )}

        <form action={isSignup ? signUp : signIn} className="login-form">
          {isSignup && (
            <>
              <label htmlFor="fullName">{t.fullName}</label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required disabled={!configured} />
            </>
          )}
          <label htmlFor="email">{t.emailAddress}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={isSignup ? "your.email@example.com" : "admin.demo@example.test"}
            required
          />
          <label htmlFor="password">{t.password}</label>
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
            {isSignup ? t.createGuestAccountBtn : t.signIn}
          </button>
        </form>
        <p className="login-footnote">
          {isSignup ? t.guestAccessNote : `${t.newGuest} `}
          {!isSignup && <Link href="/login?mode=signup">{t.createAGuestAccount}</Link>}
          {isSignup && <Link href="/login">{t.alreadyHaveAccount}</Link>}
        </p>
      </div>
    </main>
  );
}
