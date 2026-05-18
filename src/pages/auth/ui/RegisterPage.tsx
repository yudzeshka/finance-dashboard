import { Button } from "antd";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AuthCard,
  BrandHeader,
  CardFooter,
  noopSubmit,
  SocialBlock,
  TermsCheckbox,
} from "./authShared";
import { IconLock, IconMail, IconUser, IconEye, IconEyeOff } from "./authIcons";
import styles from "./AuthPage.module.scss";

export function RegisterPage() {
  const { t } = useTranslation();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      <form className={styles.form} onSubmit={noopSubmit} noValidate>
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
            />
            <Button
              type="text"
              className={styles.togglePw}
              icon={showConfirm ? <IconEyeOff /> : <IconEye />}
              onClick={() => setShowConfirm((v) => !v)}
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
