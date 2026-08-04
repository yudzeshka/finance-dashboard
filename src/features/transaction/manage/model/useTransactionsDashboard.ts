import { useFilteredTransactions } from "./useFilteredTransactions";
import { useTransactionFormModal } from "./useTransactionFormModal";
import { useTransactionMutations } from "./useTransactionMutations";
import { useTransactionQueries } from "./useTransactionQueries";

export function useTransactionsDashboard() {
  const { transactions, categoryOptions, loading, error, refetch } =
    useTransactionQueries();
  const filteredTransactions = useFilteredTransactions(transactions);
  const mutations = useTransactionMutations();
  const formModal = useTransactionFormModal({
    createTransaction: mutations.createTransaction,
    updateTransaction: mutations.updateTransaction,
    addTransactionLoading: mutations.addTransactionLoading,
    editTransactionLoading: mutations.editTransactionLoading,
  });

  return {
    // data
    transactions: filteredTransactions,
    categoryOptions,

    // query state
    loading,
    error,
    refetch,

    // modal state
    isModalOpen: formModal.isModalOpen,
    modalTitle: formModal.modalTitle,
    confirmLoading: formModal.confirmLoading,

    // form
    form: formModal.form,

    // actions
    openCreate: formModal.openCreate,
    openEdit: formModal.openEdit,
    closeModal: formModal.closeModal,
    submit: formModal.submit,
    remove: mutations.removeTransaction,

    // table state
    deleteLoading: mutations.deleteTransactionLoading,
  };
}
