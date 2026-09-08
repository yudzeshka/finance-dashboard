import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { getCategoryLabel } from "@/entities/category";
import { formatAmount, useCurrencyRatesStore } from "@/entities/currency";
import { useBudgets, useSetLimit } from "@/features/budget";
import { useAppearanceStore } from "@/features/settings/appearance";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

import { BudgetFormModal } from "../ui/BudgetFormModal";
import { BudgetsPageSkeleton } from "../ui/BudgetsPageSkeleton";
import { BudgetsView } from "../ui/BudgetsView";

export function BudgetsWidget() {
  const { t } = useTranslation();
  const currency = useAppearanceStore((s) => s.currency);
  const rates = useCurrencyRatesStore((s) => s.rates);

  const {
    budgets,
    progress,
    loading,
    error,
    refetch,
    createBudget,
    editBudget,
    removeBudget,
    createLoading,
    editLoading,
    deleteLoading,
    availableCategories,
  } = useBudgets();

  const modal = useSetLimit({
    createBudget,
    editBudget,
    createLoading,
    editLoading,
  });

  const title = t("budgets");
  const subtitle = t("budgetsSubtitle");
  const format = (usd: number) => formatAmount(usd, currency, rates);

  if (loading && budgets.length === 0) {
    return <BudgetsPageSkeleton />;
  }

  if (error && budgets.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <CategoryIcon icon="warning" size={48} className="aurora-text-secondary" />
          <div className="aurora-font-body" style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginTop: 16, marginBottom: 8 }}>
            {t("loadingError")}
          </div>
          <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
            {String(error.message)}
          </div>
          <Button type="primary" onClick={() => { void refetch(); }}>
            {t("retry")}
          </Button>
        </div>
      </AppShell>
    );
  }

  const isEmpty = !loading && budgets.length === 0;

  const editingBudget = modal.editingId
    ? budgets.find((budget) => budget.id === modal.editingId) ?? null
    : null;

  const categoryOptions = editingBudget
    ? [
        {
          label: getCategoryLabel(editingBudget.category, t),
          value: editingBudget.category_id,
        },
      ]
    : availableCategories.map((category) => ({
        label: getCategoryLabel(category, t),
        value: category.id,
      }));

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      primaryAction={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          aria-label={t("addBudget")}
          onClick={modal.openCreate}
        >
          <span className="dashboard-header__btn-label">
            {t("addBudget")}
          </span>
        </Button>
      }
    >
      {isEmpty ? (
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <div className="aurora-empty-state">
            <CategoryIcon icon="other" size={48} className="aurora-empty-state__icon" />
            <div className="aurora-font-body" style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginTop: 16, marginBottom: 8 }}>
              {t("budgetsNoData")}
            </div>
            <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
              {t("budgetsNoDataHint")}
            </div>
            <Button type="primary" onClick={modal.openCreate}>
              {t("addFirstBudget")}
            </Button>
          </div>
        </div>
      ) : (
        <BudgetsView
          progress={progress}
          format={format}
          deleteLoading={deleteLoading}
          onEdit={modal.openEdit}
          onDelete={removeBudget}
        />
      )}

      <BudgetFormModal
        open={modal.isModalOpen}
        title={modal.isEdit ? t("editBudget") : t("addBudget")}
        confirmLoading={modal.confirmLoading}
        form={modal.form}
        isEdit={modal.isEdit}
        categoryOptions={categoryOptions}
        currency={currency}
        onOk={modal.submit}
        onCancel={modal.closeModal}
      />
    </AppShell>
  );
}
