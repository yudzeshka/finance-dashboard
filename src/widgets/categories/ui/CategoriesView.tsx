import { Button } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/widgets/app-shell/ui/AppShell";

import type { CategoryFormValues, CategoryRowViewModel } from "../model/types";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryFormModal } from "./CategoryFormModal";

export type CategoriesViewProps = {
  categories: CategoryRowViewModel[];
  loading?: boolean;
  errorMessage?: string | null;
  deleteLoading?: boolean;

  isModalOpen: boolean;
  modalTitle: string;
  confirmLoading?: boolean;
  form: FormInstance<CategoryFormValues>;
  isIconPickerOpen: boolean;
  selectedIcon: string;

  onAddClick: () => void;
  onEdit: (category: CategoryRowViewModel) => void;
  onDelete: (id: string) => void;
  onModalOk: () => void;
  onModalCancel: () => void;
  onIconPickerOpenChange: (open: boolean) => void;
  onIconSelect: (key: string) => void;
};

export function CategoriesView({
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
}: CategoriesViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <AppShell
        title={t("categories")}
        subtitle={t("categoriesSubtitle")}
        primaryAction={
          <Button type="primary" onClick={onAddClick}>
            {t("addCategory")}
          </Button>
        }
      >
        {errorMessage ? <p>{errorMessage}</p> : null}

        <div className="dashboard-card">
          <CategoriesTable
            categories={categories}
            deleteLoading={deleteLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            loading={loading}
          />
        </div>
      </AppShell>

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
    </>
  );
}
