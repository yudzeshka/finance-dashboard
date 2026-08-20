import { Button } from "antd";
import { useTransactionsDashboard } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsFiltersWidget } from "../../../features/transaction/filters";
import { TransactionsTable } from "../../../widgets/transactions-table/ui/TransactionsTable";
import { TransactionFormModal } from "../../../widgets/transactions/ui/TransactionFormModal";
import { DashboardHero } from "../../../widgets/dashboardHero";
import { DashboardInsights } from "../../../widgets/dashboardInsights";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { useTranslation } from "react-i18next";

export function DashboardPage() {
  const dashboard = useTransactionsDashboard();
  const { t } = useTranslation();

  if (dashboard.loading)
    return (
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
      >
        <DashboardPageSkeleton />
      </AppShell>
    );

  if (dashboard.error)
    return (
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
      >
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>⚠️</div>
          <div
            className="aurora-font-body"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--aurora-text)",
              marginBottom: 8,
            }}
          >
            {t("loadingError")}
          </div>
          <div
            className="aurora-text-secondary"
            style={{ fontSize: 14, marginBottom: 20 }}
          >
            {String(dashboard.error)}
          </div>
          <Button
            type="primary"
            onClick={() => dashboard.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      </AppShell>
    );

  return (
    <AppShell
      title={t("transactions")}
      subtitle={t("trackIncomeAndExpenses")}
      primaryAction={
        <Button type="primary" onClick={dashboard.openCreate}>
          {t("addTransaction")}
        </Button>
      }
    >
      <div className="aurora-surface" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. Hero Balance */}
        <DashboardHero.Widget />

        {/* 2. Insight tiles */}
        <DashboardInsights.Widget />

        {/* 3. Filters */}
        <div className="aurora-card" style={{ padding: "12px 16px" }}>
          <TransactionsFiltersWidget />
        </div>

        {/* 4. Table */}
        <div className="aurora-card" style={{ padding: 16 }}>
          <TransactionsTable
            transactions={dashboard.transactions}
            onEdit={dashboard.openEdit}
            onDelete={dashboard.remove}
            deleteLoading={dashboard.deleteLoading}
            onAddClick={dashboard.openCreate}
          />
        </div>
      </div>

      {/* Modal (outside AppShell content flow to render at root) */}
      <TransactionFormModal
        isModalOpen={dashboard.isModalOpen}
        modalTitle={dashboard.modalTitle}
        confirmLoading={dashboard.confirmLoading}
        onModalOk={dashboard.submit}
        onModalCancel={dashboard.closeModal}
        form={dashboard.form}
        categoryOptions={dashboard.categoryOptions}
      />
    </AppShell>
  );
}
