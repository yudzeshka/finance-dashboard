import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { message } from "antd";
import { useTranslation } from "react-i18next";

interface UseSecurityResult {
  resettingPassword: boolean;
  passwordError: string | null;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<void>;
}

export function useSecurity(): UseSecurityResult {
  const { user, nhost } = useAuth();
  const { t } = useTranslation();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const resetPassword = useCallback(
    async (newPassword: string, confirmPassword: string) => {
      setPasswordError(null);
      if (newPassword.length < 8) {
        setPasswordError(t("settingsPasswordMinLength"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError(t("settingsPasswordsDoNotMatch"));
        return;
      }
      setResettingPassword(true);
      try {
        const email = user?.email;
        if (!email) throw new Error("No email found");
        await nhost.auth.sendPasswordResetEmail({ email });
        message.success(t("settingsPasswordResetSent"));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setPasswordError(msg);
        message.error(t("settingsPasswordResetError"));
      } finally {
        setResettingPassword(false);
      }
    },
    [nhost, user, t],
  );

  return {
    resettingPassword,
    passwordError,
    resetPassword,
  };
}
