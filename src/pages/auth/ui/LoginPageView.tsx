import { Button, Checkbox } from "antd";
import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UseLoginResult } from "@/features/auth/login";
import {
  AuthCard,
  BrandHeader,
  CardFooter,
  SocialBlock,
} from "./authShared";
import { IconLock, IconMail, IconEye, IconEyeOff } from "./authIcons";
import styles from "./AuthPage.module.scss";

export function LoginPageView({
  email,
  password,
  showPassword,
  isSubmitting,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: UseLoginResult) {
  const { t } = useTranslation();
  const emailId = useId();
  const passwordId = useId();

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

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {error ? (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        ) : null}

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
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isSubmitting}
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
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={isSubmitting}
            />
            <Button
              type="text"
              className={styles.togglePw}
              icon={showPassword ? <IconEyeOff /> : <IconEye />}
              onClick={onTogglePassword}
              disabled={isSubmitting}
              aria-label={
                showPassword ? t("authHidePassword") : t("authShowPassword")
              }
            />
          </div>
        </div>

        <div className={styles.rowBetween}>
          <Checkbox disabled={isSubmitting}>{t("authRememberMe")}</Checkbox>
          <Button type="link" className={styles.link} disabled={isSubmitting}>
            {t("authForgotPassword")}
          </Button>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          className={styles.primaryBtn}
          loading={isSubmitting}
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
