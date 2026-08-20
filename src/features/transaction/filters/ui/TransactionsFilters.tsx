import {
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Slider,
  Typography,
} from "antd";
import {
  CloseOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { TransactionFilters } from "../model/types";
import type { Category } from "../../../../entities/category";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

export type TransactionsFiltersProps = {
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  amountBounds?: [number, number];
  amountRange?: number[];
  onAmountRangeChange?: (value: number[]) => void;
  onAmountRangeCommit?: (value: number[]) => void;
  filters?: TransactionFilters;
  filtersValues?: TransactionFilters;
  onFiltersChange?: <K extends keyof TransactionFilters>(
    value: TransactionFilters[K],
    key: K,
  ) => void;
  onSearchChange?: (value: string) => void;
  onDateChange?: (value: [Dayjs | null, Dayjs | null] | null) => void;
  resetFilters?: () => void;
  categories?: Category[];
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
};

export function TransactionsFilters({
  onOpen,
  onClose,
  isOpen,
  amountBounds,
  amountRange,
  onAmountRangeChange,
  onAmountRangeCommit,
  filters,
  filtersValues,
  onFiltersChange,
  onSearchChange,
  onDateChange,
  resetFilters,
  categories = [],
  onApplyFilters,
  onClearFilters,
}: TransactionsFiltersProps) {
  const sliderMin = amountBounds?.[0] ?? 0;
  const sliderMax = amountBounds?.[1] ?? 100;
  const sliderMarks =
    sliderMin === sliderMax
      ? { [sliderMin]: String(sliderMin) }
      : { [sliderMin]: String(sliderMin), [sliderMax]: String(sliderMax) };
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 5,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder={t("search")}
          style={{ flex: "1 1 140px", minWidth: "120px" }}
          prefix={<SearchOutlined />}
          value={filters?.search}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        <Button
          icon={<FilterOutlined />}
          onClick={onOpen}
          style={{ minWidth: "115px" }}
        >
          {t("filters")}
        </Button>
        <Button icon={<CloseOutlined />} onClick={resetFilters} />
      </div>
      <Modal
        open={isOpen}
        onCancel={onClose}
        okText={t("apply")}
        cancelText={t("clear")}
        title={
          <Typography.Text strong style={{ fontSize: 22 }}>
            {t("selectFilters")}
          </Typography.Text>
        }
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={onClearFilters}>{t("clear")}</Button>
            <Button type="primary" onClick={onApplyFilters}>
              {t("apply")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Typography.Text>{t("category")}</Typography.Text>
          <Select
            placeholder={t("selectCategory")}
            allowClear
            options={categories.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            value={filtersValues?.category}
            onChange={(value) => onFiltersChange?.(value, "category")}
          />
          <Typography.Text>{t("type")}</Typography.Text>
          <Select
            placeholder={t("selectType")}
            allowClear
            options={[
              { value: "INCOME", label: t("income") },
              { value: "EXPENSE", label: t("expense") },
            ]}
            value={filtersValues?.type}
            onChange={(value) => onFiltersChange?.(value, "type")}
          />
          <Typography.Text>{t("amount")}</Typography.Text>
          <Slider
            min={sliderMin}
            max={sliderMax}
            marks={sliderMarks}
            range={{ draggableTrack: true }}
            value={amountRange}
            onChange={onAmountRangeChange}
            onChangeComplete={onAmountRangeCommit}
          />
          <Typography.Text>{t("date")}</Typography.Text>
          <DatePicker.RangePicker
            placeholder={[t("startDate"), t("tillNow")]}
            allowEmpty={[false, true]}
            value={
              filtersValues?.dateFrom
                ? [
                    dayjs(filtersValues.dateFrom),
                    filtersValues.dateTo ? dayjs(filtersValues.dateTo) : null,
                  ]
                : null
            }
            onChange={(dates) => onDateChange?.(dates)}
          />
        </div>
      </Modal>
    </>
  );
}
