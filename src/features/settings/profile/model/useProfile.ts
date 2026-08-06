import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { message } from "antd";
import { useTranslation } from "react-i18next";

interface UseProfileResult {
  displayName: string;
  email: string;
  saving: boolean;
  error: string | null;
  updateProfile: (name: string) => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { user, nhost } = useAuth();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = user?.displayName ?? "";
  const email = user?.email ?? "";

  const updateProfile = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setError(t("settingsNameRequired"));
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const session = nhost.getUserSession();
        if (!session) throw new Error("Not authenticated");
        const { error: updateError } = await nhost.auth.updateUser({
          displayName: name.trim(),
        });
        if (updateError) throw updateError;
        message.success(t("settingsProfileSaved"));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        message.error(t("settingsProfileError"));
      } finally {
        setSaving(false);
      }
    },
    [nhost, t],
  );

  return { displayName, email, saving, error, updateProfile };
}
