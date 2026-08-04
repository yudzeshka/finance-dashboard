import { useTranslation } from "react-i18next";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";

import styles from "./CategoriesPageSkeleton.module.scss";

export function CategoriesPageSkeleton() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("categories")} subtitle={t("categoriesSubtitle")}>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.shimmerLine} style={{ width: 40, height: 40, borderRadius: "50%" }} />
            <div className={styles.shimmerLine} style={{ width: "60%", height: 14 }} />
            <div className={styles.shimmerLine} style={{ width: "40%", height: 12 }} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
