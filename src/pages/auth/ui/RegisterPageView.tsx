import { Button } from "antd";
import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UseRegisterResult } from "@/features/auth/register";
import {
  AuthCard,
  BrandHeader,
  CardFooter,
  SocialBlock,
  TermsCheckbox,
} from "./authShared";
import { IconLock, IconMail, IconUser, IconEye, IconEyeOff } from "./authIcons";
import styles from "./AuthPage.module.scss";

export function RegisterPageView({
  displayName,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirm,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirm,
  onSubmit,
  isSubmitting,
  success,
  error,
}: UseRegisterResult) {
  const { t } = useTranslation();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();

  if (success) {
    return (
      <AuthCard>
        <BrandHeader />
        <h2 className={styles.sectionTitle}>{t("authCheckEmailTitle")}</h2>
        <p className={styles.sectionSubtitle}>
          {t("authCheckEmailSent")} <strong>{email}</strong>
        </p>
        <p className={styles.sectionSubtitle}>{t("authCheckEmailHint")}</p>
        <p className={styles.switchLine}>
          <Link to="/auth/login" className={styles.link}>
            {t("authSignInLink")}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <BrandHeader />
      <Link to="/auth" className={styles.backLink}>
        ← {t("authBackToHub")}
      </Link>
      <h2 id="auth-register-title" className={styles.sectionTitle}>
        {t("authRegisterTitle")}
      </h2>
      <p className={styles.sectionSubtitle}>{t("authRegisterSubtitle")}</p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {error ? (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            {t("authName")}
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <IconUser />
            </span>
            <input
              id={nameId}
              className={styles.input}
              name="displayName"
              type="text"
              autoComplete="name"
              placeholder={t("authPlaceholderName")}
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

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
              autoComplete="new-password"
              placeholder={t("authPlaceholderPasswordMin")}
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor={confirmId}>
            {t("authConfirmPassword")}
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>
              <IconLock />
            </span>
            <input
              id={confirmId}
              className={styles.input}
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("authPlaceholderConfirm")}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={isSubmitting}
            />
            <Button
              type="text"
              className={styles.togglePw}
              icon={showConfirm ? <IconEyeOff /> : <IconEye />}
              onClick={onToggleConfirm}
              disabled={isSubmitting}
              aria-label={
                showConfirm ? t("authHidePassword") : t("authShowPassword")
              }
            />
          </div>
        </div>

        <TermsCheckbox />

        <Button
          type="primary"
          htmlType="submit"
          block
          className={styles.primaryBtn}
          loading={isSubmitting}
        >
          {t("authSignUp")}
        </Button>

        <SocialBlock />

        <p className={styles.switchLine}>
          {t("authHaveAccount")}{" "}
          <Link to="/auth/login" className={styles.link}>
            {t("authSignInLink")}
          </Link>
        </p>
      </form>

      <CardFooter />
    </AuthCard>
  );
}
