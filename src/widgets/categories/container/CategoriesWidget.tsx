import { Button } from "antd";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

import { CategoriesPageSkeleton } from "../ui/CategoriesPageSkeleton";
import { CategoriesView } from "../ui/CategoriesView";
import { CategoryFormModal } from "../ui/CategoryFormModal";
import { useContainer } from "./useContainer";

export function CategoriesWidget() {
  const { t } = useTranslation();
  const container = useContainer();

  const {
    categories,
    loading,
    errorMessage,
    deleteLoading,
    isModalOpen,
    modalTitle,
    confirmLoading,
    form,
    isIconPickerOpen,
    selectedIcon,
    onAddClick,
    onEdit,
    onDelete,
    onModalOk,
    onModalCancel,
    onIconPickerOpenChange,
    onIconSelect,
    refetch,
  } = container;

  const title = t("categories");
  const subtitle = t("categoriesSubtitle");

  // Loading state — initial load with no cached data
  if (loading && categories.length === 0) {
    return <CategoriesPageSkeleton />;
  }

  // Error state — no data available
  if (errorMessage && categories.length === 0) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <CategoryIcon icon="warning" size={48} className="aurora-text-secondary" />
          <div className="aurora-font-body" style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginTop: 16, marginBottom: 8 }}>
            {t("loadingError")}
          </div>
          <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
            {String(errorMessage)}
          </div>
          <Button type="primary" onClick={() => { void refetch(); }}>
            {t("retry")}
          </Button>
        </div>
      </AppShell>
    );
  }

  // Empty + Normal states share AppShell + CategoryFormModal
  const isEmpty = !loading && categories.length === 0;

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      primaryAction={
        <Button type="primary" onClick={onAddClick}>
          {t("addCategory")}
        </Button>
      }
    >
      {isEmpty ? (
        <div className="aurora-card" style={{ padding: 48, textAlign: "center" }}>
          <div className="aurora-empty-state">
            <CategoryIcon icon="other" size={48} className="aurora-empty-state__icon" />
            <div className="aurora-font-body" style={{ fontSize: 16, fontWeight: 500, color: "var(--aurora-text)", marginTop: 16, marginBottom: 8 }}>
              {t("categoriesGridEmpty")}
            </div>
            <div className="aurora-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
              {t("addFirstCategory")}
            </div>
            <Button type="primary" onClick={onAddClick}>
              {t("addCategory")}
            </Button>
          </div>
        </div>
      ) : (
        <CategoriesView
          categories={categories}
          deleteLoading={deleteLoading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      <CategoryFormModal
        open={isModalOpen}
        title={modalTitle}
        confirmLoading={confirmLoading}
        form={form}
        isIconPickerOpen={isIconPickerOpen}
        onIconPickerOpenChange={onIconPickerOpenChange}
        onIconSelect={onIconSelect}
        selectedIcon={selectedIcon}
        onOk={onModalOk}
        onCancel={onModalCancel}
      />
    </AppShell>
  );
}
