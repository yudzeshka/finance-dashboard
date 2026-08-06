import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { purgeApolloCache } from "@/app/providers/apollo";
import { useNavigate } from "react-router-dom";

interface UseSecurityResult {
  resettingPassword: boolean;
  deletingAccount: boolean;
  passwordError: string | null;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export function useSecurity(): UseSecurityResult {
  const { user, nhost } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
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

  const deleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      const session = nhost.getUserSession();
      if (!session) throw new Error("Not authenticated");

      await nhost.auth.signOut({ all: true });
      await purgeApolloCache();
      message.success(t("settingsDeleteAccountSuccess"));
      navigate("/auth", { replace: true });
    } catch (err: unknown) {
      message.error(t("settingsDeleteAccountError"));
      throw err;
    } finally {
      setDeletingAccount(false);
    }
  }, [nhost, navigate, t]);

  return {
    resettingPassword,
    deletingAccount,
    passwordError,
    resetPassword,
    deleteAccount,
  };
}
