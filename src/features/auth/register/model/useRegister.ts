import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { UseRegisterResult } from "./types";
import { generatePKCEPair } from "@nhost/nhost-js/auth";

const MIN_PASSWORD_LENGTH = 8;

export function useRegister(): UseRegisterResult {
  const { nhost, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("authPasswordMinLength", { min: MIN_PASSWORD_LENGTH }));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("authPasswordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { verifier, challenge } = await generatePKCEPair();
      localStorage.setItem("nhost_pkce_verifier", verifier);
      const response = await nhost.auth.signUpEmailPassword({
        email,
        password,
        options: {
          displayName,
          redirectTo: `${window.location.origin}/auth/verify`,
        },
        codeChallenge: challenge,
      });

      if (response.body?.session) {
        navigate("/");
        return;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("authUnknownError");
      setError(t("authSignUpError", { message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    displayName,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    isSubmitting,
    success,
    error,
    onDisplayNameChange: setDisplayName,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onTogglePassword: () => setShowPassword((v) => !v),
    onToggleConfirm: () => setShowConfirm((v) => !v),
    onSubmit: handleSubmit,
  };
}
