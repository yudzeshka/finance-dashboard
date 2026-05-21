import { useTransactionsDashboard } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsFiltersWidget } from "../../../features/transaction/filters";
import { TransactionsWidget } from "../../../widgets/transactions/ui/TransactionsWidget";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { useTranslation } from "react-i18next";

export function DashboardPage() {
  const transactionsDashboard = useTransactionsDashboard();
  const { t } = useTranslation();

  if (transactionsDashboard.loading)
    return (
      <AppShell
        title={t("transactions")}
        subtitle={t("trackIncomeAndExpenses")}
      >
        <DashboardPageSkeleton />
      </AppShell>
    );
  if (transactionsDashboard.error) return <p>Error</p>;

  return (
    <TransactionsWidget
      transactions={transactionsDashboard.transactions}
      deleteLoading={transactionsDashboard.deleteLoading}
      onDelete={transactionsDashboard.remove}
      onEdit={transactionsDashboard.openEdit}
      onAddClick={transactionsDashboard.openCreate}
      isModalOpen={transactionsDashboard.isModalOpen}
      modalTitle={transactionsDashboard.modalTitle}
      confirmLoading={transactionsDashboard.confirmLoading}
      onModalOk={transactionsDashboard.submit}
      onModalCancel={transactionsDashboard.closeModal}
      form={transactionsDashboard.form}
      categoryOptions={transactionsDashboard.categoryOptions}
      filtersSlot={<TransactionsFiltersWidget />}
    />
  );
}
