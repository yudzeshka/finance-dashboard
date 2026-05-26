import { Skeleton } from "antd";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { useTranslation } from "react-i18next";

export function CategoriesPageSkeleton() {
  const { t } = useTranslation();

  return (
    <AppShell title={t("categories")} subtitle={t("categoriesSubtitle")}>
      <Skeleton active title={false} paragraph={{ rows: 12 }} />
    </AppShell>
  );
}
