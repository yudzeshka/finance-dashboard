import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { UseLoginResult } from "./types";

export function useLogin(): UseLoginResult {
  const { nhost, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await nhost.auth.signInEmailPassword({
        email,
        password,
      });

      if (response.body?.session) {
        navigate("/");
        return;
      }

      setError(t("authSignInFailed"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("authUnknownError");
      setError(t("authSignInError", { message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    showPassword,
    isSubmitting,
    error,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onTogglePassword: () => setShowPassword((v) => !v),
    onSubmit: handleSubmit,
  };
}
