import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { UseVerifyResult } from "./types";

const PKCE_VERIFIER_KEY = "nhost_pkce_verifier";

function consumePKCEVerifier(): string | null {
  const verifier = localStorage.getItem(PKCE_VERIFIER_KEY);
  if (verifier) {
    localStorage.removeItem(PKCE_VERIFIER_KEY);
  }
  return verifier;
}

export function useVerify(): UseVerifyResult {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [error, setError] = useState<string>("");
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});

  const { nhost } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get("error");
    const authErrorDescription = params.get("errorDescription");
    const code = params.get("code");

    const allParams: Record<string, string> = {};
    params.forEach((value, key) => {
      allParams[key] = value;
    });
    setUrlParams(allParams);

    if (authError) {
      setStatus("error");
      setError(authErrorDescription || authError);
      return;
    }

    if (!code) {
      setStatus("error");
      setError("No authorization code found in URL");
      return;
    }

    const authCode = code;
    let isMounted = true;

    async function exchangeCode(): Promise<void> {
      try {
        // Small delay to ensure component is fully mounted
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!isMounted) return;

        const codeVerifier = consumePKCEVerifier();
        if (!codeVerifier) {
          setStatus("error");
          setError(
            "No PKCE verifier found. The sign-in must be initiated from the same browser tab.",
          );
          return;
        }

        await nhost.auth.tokenExchange({ code: authCode, codeVerifier });

        if (!isMounted) return;

        setStatus("success");

        setTimeout(() => {
          if (isMounted) navigate("/");
        }, 1500);
      } catch (err) {
        const message = (err as Error).message || "Unknown error";
        if (!isMounted) return;

        setStatus("error");
        setError(`An error occurred during verification: ${message}`);
      }
    }

    exchangeCode();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate, nhost.auth]);

  return {
    error,
    urlParams,
    status,
  };
}
