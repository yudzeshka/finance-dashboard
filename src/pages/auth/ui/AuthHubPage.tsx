import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthCard, BrandHeader, CardFooter } from "./authShared";
import { IconChevronRight } from "./authIcons";
import styles from "./AuthPage.module.scss";
import { useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export function AuthHubPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  return (
    <AuthCard>
      <BrandHeader />
      <h2 id="auth-hub-title" className={styles.sectionTitle}>
        {t("authHubTitle")}
      </h2>
      <p className={styles.sectionSubtitle}>{t("authHubSubtitle")}</p>

      <div className={styles.choiceList} role="list">
        <NavLink
          to="login"
          className={styles.choiceNav}
          role="listitem"
          aria-describedby="auth-hub-login-desc"
        >
          <div className={styles.choiceNavText}>
            <p className={styles.choiceTitle}>{t("authHubLoginTitle")}</p>
            <p id="auth-hub-login-desc" className={styles.choiceDesc}>
              {t("authHubLoginDesc")}
            </p>
          </div>
          <span className={styles.choiceChevron} aria-hidden>
            <IconChevronRight />
          </span>
        </NavLink>

        <NavLink
          to="register"
          className={styles.choiceNav}
          role="listitem"
          aria-describedby="auth-hub-register-desc"
        >
          <div className={styles.choiceNavText}>
            <p className={styles.choiceTitle}>{t("authHubRegisterTitle")}</p>
            <p id="auth-hub-register-desc" className={styles.choiceDesc}>
              {t("authHubRegisterDesc")}
            </p>
          </div>
          <span className={styles.choiceChevron} aria-hidden>
            <IconChevronRight />
          </span>
        </NavLink>
      </div>

      <CardFooter />
    </AuthCard>
  );
}
