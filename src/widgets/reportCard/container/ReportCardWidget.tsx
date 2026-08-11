import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { ReportCard } from "../ui/ReportCard";
import styles from "../ui/styles.module.scss";
import { ReportCardWidgetSkeleton } from "./ReportCardWidgetSkeleton";
import { useContainer } from "./useContainer";

export function ReportCardWidget() {
  const { cards, loading, error, refetch } = useContainer();
  const { t } = useTranslation();

  if (loading) return <ReportCardWidgetSkeleton />;

  if (error) {
    return (
      <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
        <ExclamationCircleOutlined
          style={{
            fontSize: 48,
            color: "var(--aurora-text-secondary)",
            opacity: 0.6,
            marginBottom: 16,
          }}
        />
        <div
          className="aurora-font-body"
          style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginBottom: 8 }}
        >
          {t("loadingError")}
        </div>
        <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
          {String(error)}
        </div>
        <Button type="primary" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.cardsGrid}>
      {cards.map((card) => (
        <ReportCard key={card.id} {...card} />
      ))}
    </div>
  );
}
