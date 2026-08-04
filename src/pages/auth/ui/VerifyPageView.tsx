import { Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UseVerifyResult } from "@/features/auth/verify/model/types";
import { AuthCard } from "./authShared";
import { IconCheck, IconAlert } from "./authIcons";
import styles from "./AuthPage.module.scss";

export function VerifyPageView({ status, error }: UseVerifyResult) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  let title = "";
  let subtitle = "";

  if (status === "verifying") {
    title = t("authVerifyingTitle");
    subtitle = t("authVerifyingSubtitle");
  } else if (status === "success") {
    title = t("authVerifySuccessTitle");
    subtitle = t("authVerifySuccessSubtitle");
  } else {
    title = t("authVerifyErrorTitle");
    subtitle = error ?? "";
  }

  return (
    <div className={styles.verifyStandalone}>
      <AuthCard>
        <div className={styles.verifyStatus} role="status" aria-live="polite">
          {status === "verifying" ? (
            <Spin size="large" />
          ) : (
            <span className={styles.verifyIcon} aria-hidden>
              {status === "success" ? <IconCheck /> : <IconAlert />}
            </span>
          )}
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle ? (
            <p className={styles.sectionSubtitle}>{subtitle}</p>
          ) : null}
          {status === "error" ? (
            <div className={styles.verifyActions}>
              <Button
                type="primary"
                block
                className={styles.primaryBtn}
                onClick={() => navigate("/auth/login")}
              >
                {t("authVerifyBackToSignIn")}
              </Button>
            </div>
          ) : null}
        </div>
      </AuthCard>
    </div>
  );
}
