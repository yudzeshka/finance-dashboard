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

export type TransactionsFiltersProps = {
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  amountRange?: number[];
  onAmountRangeChange?: (value: number[]) => void;
};

export function TransactionsFilters({
  onOpen,
  onClose,
  isOpen,
  amountRange,
  onAmountRangeChange,
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
        />
        <Button icon={<FilterOutlined />} onClick={onOpen}>
          Filters
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={() => console.log("clear filters")}
        />
      </div>
      <Modal
        open={isOpen}
        onCancel={onClose}
        okText="Apply"
        cancelText="Clear"
        title={
          <Typography.Text strong style={{ fontSize: 22 }}>
            Selet filters
          </Typography.Text>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Typography.Text>Category</Typography.Text>
          <Select placeholder="Select category" />
          <Typography.Text>Type</Typography.Text>
          <Select placeholder="Select type" />
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
            onChange={(date, dateString) => {
              console.log(date, dateString);
            }}
          />
        </div>
      </Modal>
    </>
  );
}
