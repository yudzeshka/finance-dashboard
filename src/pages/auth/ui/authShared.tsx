import { Button, Checkbox } from "antd";
import { useTranslation } from "react-i18next";
import type { FormEvent, ReactNode } from "react";
import { LangSwitcher } from "../../../widgets/langSwitcher";
import {
  IconChart,
  IconGlobe,
  IconGoogle,
  IconApple,
  IconGithub,
  IconHelp,
} from "./authIcons";
import styles from "./AuthPage.module.scss";

export function noopSubmit(e: FormEvent) {
  e.preventDefault();
}

export function BrandHeader() {
  const { t } = useTranslation();
  return (
    <div className={styles.brand}>
      <div className={styles.logo} aria-hidden>
        <IconChart />
      </div>
      <div className={styles.brandText}>
        <p className={styles.appName}>{t("financeDashboard")}</p>
        <p className={styles.tagline}>{t("authTagline")}</p>
      </div>
    </div>
  );
}

export function CardFooter() {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <IconGlobe />
        <div className={styles.langRow}>
          <LangSwitcher.Widget />
        </div>
      </div>
      <span className={styles.footerDivider} aria-hidden />
      <Button type="text" className={styles.helpBtn} icon={<IconHelp />}>
        {t("authHelp")}
      </Button>
    </div>
  );
}

export function SocialBlock() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span>{t("authOrContinueWith")}</span>
        <span className={styles.dividerLine} />
      </div>
      <div className={styles.socialRow}>
        <Button
          type="default"
          variant="outlined"
          block
          className={styles.socialBtn}
          htmlType="button"
        >
          <span className={styles.socialIconSlot}>
            <IconGoogle />
          </span>
          <span className={styles.socialLabel}>{t("authGoogle")}</span>
        </Button>
        <Button
          type="default"
          variant="outlined"
          block
          className={styles.socialBtn}
          htmlType="button"
        >
          <span className={styles.socialIconSlot}>
            <IconApple />
          </span>
          <span className={styles.socialLabel}>{t("authApple")}</span>
        </Button>
        <Button
          type="default"
          variant="outlined"
          block
          className={styles.socialBtn}
          htmlType="button"
        >
          <span className={styles.socialIconSlot}>
            <IconGithub />
          </span>
          <span className={styles.socialLabel}>{t("authGithub")}</span>
        </Button>
      </div>
    </>
  );
}

export function TermsCheckbox() {
  const { t } = useTranslation();
  return (
    <div className={`${styles.field} ${styles.terms}`}>
      <Checkbox>
        {t("authTermsPrefix")}{" "}
        <span className={styles.termsAccent} role="presentation">
          {t("authTermsOfUse")}
        </span>{" "}
        {t("authTermsAnd")}{" "}
        <span className={styles.termsAccent} role="presentation">
          {t("authPrivacyPolicy")}
        </span>
      </Checkbox>
    </div>
  );
}

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className={styles.pageInner}>
      <section className={styles.card}>{children}</section>
    </div>
  );
}

export function ShowcasePanel() {
  const { t } = useTranslation();
  return (
    <div className={styles.showcaseInner}>
      <div className={styles.showcaseBrand}>
        <div className={styles.showcaseLogo} aria-hidden>
          <IconChart />
        </div>
        <span className={styles.showcaseAppName}>{t("financeDashboard")}</span>
      </div>
      <div className={styles.showcaseCopy}>
        <h1 className={styles.showcaseHeadline}>{t("authShowcaseHeadline")}</h1>
        <p className={styles.showcaseDesc}>{t("authShowcaseDesc1")}</p>
        <p className={styles.showcaseDesc}>{t("authShowcaseDesc2")}</p>
      </div>
      <p className={styles.showcaseMeta}>{t("authShowcaseMeta")}</p>
    </div>
  );
}
