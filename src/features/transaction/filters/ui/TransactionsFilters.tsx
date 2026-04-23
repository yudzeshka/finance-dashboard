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

export type TransactionsFiltersProps = {
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  amountRange?: number[];
  onAmountRangeChange?: (value: number[]) => void;
  filters?: TransactionFilters;
  filtersValues?: TransactionFilters;
  onFiltersChange?: <K extends keyof TransactionFilters>(
    value: TransactionFilters[K],
    key: K,
  ) => void;
  onDateChange?: (value: [string, string]) => void;
  resetFilters?: () => void;
  categories?: Category[];
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
};

export function TransactionsFilters({
  onOpen,
  onClose,
  isOpen,
  amountRange,
  onAmountRangeChange,
  filters,
  filtersValues,
  onFiltersChange,
  onDateChange,
  resetFilters,
  categories,
  onApplyFilters,
  onClearFilters,
}: TransactionsFiltersProps) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 5,
          marginBottom: 10,
        }}
      >
        <Input
          placeholder="Search"
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
          value={filters?.search}
          onChange={(e) => onFiltersChange?.(e.target.value, "search")}
        />
        <Button icon={<FilterOutlined />} onClick={onOpen}>
          Filters
        </Button>
        <Button icon={<CloseOutlined />} onClick={resetFilters} />
      </div>
      <Modal
        open={isOpen}
        onCancel={onClose}
        okText="Apply"
        cancelText="Clear"
        title={
          <Typography.Text strong style={{ fontSize: 22 }}>
            Select filters
          </Typography.Text>
        }
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={onClearFilters}>Clear</Button>
            <Button type="primary" onClick={onApplyFilters}>
              Apply
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Typography.Text>Category</Typography.Text>
          <Select
            placeholder="Select category"
            allowClear
            options={categories.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            value={filtersValues?.category}
            onChange={(value) => onFiltersChange?.(value, "category")}
          />
          <Typography.Text>Type</Typography.Text>
          <Select
            placeholder="Select type"
            allowClear
            options={[
              { value: "income", label: "Income" },
              { value: "expense", label: "Expense" },
            ]}
            value={filtersValues?.type}
            onChange={(value) => onFiltersChange?.(value, "type")}
          />
          <Typography.Text>Amount</Typography.Text>
          <Slider
            marks={{ 0: "0", 100: "100" }}
            range={{ draggableTrack: true }}
            value={amountRange}
            onChange={onAmountRangeChange}
          />
          <Typography.Text>Date</Typography.Text>
          <DatePicker.RangePicker
            placeholder={["Start Date", "Till Now"]}
            allowEmpty={[false, true]}
            value={
              filtersValues?.dateFrom
                ? [
                    dayjs(filtersValues.dateFrom),
                    filtersValues.dateTo ? dayjs(filtersValues.dateTo) : null,
                  ]
                : null
            }
            onChange={(_, dateStrings) => onDateChange?.(dateStrings)}
          />
        </div>
      </Modal>
    </>
  );
}
