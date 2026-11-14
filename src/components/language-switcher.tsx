"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

function getStoredLanguage(): "en" | "tr" {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-z]{2})/i);
  return match && match[1] === "tr" ? "tr" : "en";
}

export function GoogleTranslateScript() {
  useEffect(() => {
    // Check if script is already present
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,tr",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} aria-hidden="true" />;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [currentLang, setCurrentLang] = useState<"en" | "tr">("en");

  useEffect(() => {
    setCurrentLang(getStoredLanguage());
  }, []);

  function switchLanguage(targetLang: "en" | "tr") {
    if (targetLang === currentLang) return;

    const hostname = window.location.hostname;
    // Set cookie for path=/ and with domain
    document.cookie = `googtrans=/en/${targetLang}; path=/;`;
    if (hostname.includes(".")) {
      document.cookie = `googtrans=/en/${targetLang}; domain=.${hostname}; path=/;`;
    }

    setCurrentLang(targetLang);

    // Try finding the Google combo element
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event("change"));
    } else {
      // If element not loaded yet, reload to let Google Translate read cookie on mount
      window.location.reload();
    }
  }

  const isTr = currentLang === "tr";

  return (
    <div
      className="lang-switcher-container"
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        background: "#f0f2ef",
        border: "1px solid #dcdfd9",
        padding: "2px",
        gap: "2px",
      }}
    >
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: compact ? "3px 8px" : "4px 10px",
          borderRadius: "999px",
          border: "none",
          background: !isTr ? "#ffffff" : "transparent",
          color: !isTr ? "#171813" : "#686c62",
          fontWeight: !isTr ? 700 : 500,
          fontSize: compact ? "11px" : "12px",
          boxShadow: !isTr ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        aria-label="Switch to English"
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => switchLanguage("tr")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: compact ? "3px 8px" : "4px 10px",
          borderRadius: "999px",
          border: "none",
          background: isTr ? "#1c3b2b" : "transparent",
          color: isTr ? "#ffffff" : "#686c62",
          fontWeight: isTr ? 700 : 500,
          fontSize: compact ? "11px" : "12px",
          boxShadow: isTr ? "0 1px 2px rgba(0,0,0,0.12)" : "none",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        aria-label="Türkçe diline geç"
        title="Türkçe"
      >
        <span>🇹🇷</span>
        <span>TR</span>
      </button>
    </div>
  );
}
