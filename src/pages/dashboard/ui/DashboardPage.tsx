import { useTransactionsDashboard } from "../../../features/transaction/manage/model/useTransactionsDashboard";
import { TransactionsWidget } from "../../../widgets/transactions/ui/TransactionsWidget";

export function DashboardPage() {
  const transactionsDashboard = useTransactionsDashboard();

  if (transactionsDashboard.loading) return <p>Loading...</p>;
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
    />
  );
}
