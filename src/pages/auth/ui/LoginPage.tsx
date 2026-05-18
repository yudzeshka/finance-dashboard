import { Button, Checkbox } from "antd";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AuthCard,
  BrandHeader,
  CardFooter,
  noopSubmit,
  SocialBlock,
} from "./authShared";
import { IconLock, IconMail, IconEye, IconEyeOff } from "./authIcons";
import styles from "./AuthPage.module.scss";

export function LoginPage() {
  const { t } = useTranslation();
  const emailId = useId();
  const passwordId = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthCard>
      <BrandHeader />
      <Link to="/auth" className={styles.backLink}>
        ← {t("authBackToHub")}
      </Link>
      <h2 id="auth-login-title" className={styles.sectionTitle}>
        {t("authLoginTitle")}
      </h2>
      <p className={styles.sectionSubtitle}>{t("authLoginSubtitle")}</p>

      <form className={styles.form} onSubmit={noopSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            {t("authEmail")}
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <IconMail />
            </span>
            <input
              id={emailId}
              className={styles.input}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("authPlaceholderEmail")}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={passwordId}>
            {t("authPassword")}
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <IconLock />
            </span>
            <input
              id={passwordId}
              className={styles.input}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("authPlaceholderPassword")}
            />
            <Button
              type="text"
              className={styles.togglePw}
              icon={showPassword ? <IconEyeOff /> : <IconEye />}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? t("authHidePassword") : t("authShowPassword")
              }
            />
          </div>
        </div>

        <div className={styles.rowBetween}>
          <Checkbox>{t("authRememberMe")}</Checkbox>
          <Button type="link" className={styles.link}>
            {t("authForgotPassword")}
          </Button>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          className={styles.primaryBtn}
        >
          {t("authSignIn")}
        </Button>

        <SocialBlock />

        <p className={styles.switchLine}>
          {t("authNoAccount")}{" "}
          <Link to="/auth/register" className={styles.link}>
            {t("authSignUpLink")}
          </Link>
        </p>
      </form>

      <CardFooter />
    </AuthCard>
  );
}
