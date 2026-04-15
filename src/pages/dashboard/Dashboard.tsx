import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_CATEGORIES,
  GET_TRANSACTIONS,
} from "../../shared/api/graphql/queries";
import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
} from "../../shared/api/graphql/mutations";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Radio,
  Select,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import { useState } from "react";
import type { Dayjs } from "dayjs";

type TransactionType = "INCOME" | "EXPENSE";

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date?: string | null;
  description?: string | null;
};

type GetTransactionsData = {
  transactions: Transaction[];
};

type GetCategoriesData = {
  categories: Category[];
};

type AddTransactionVars = {
  amount: number;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  type: TransactionType;
};

type DeleteTransactionVars = {
  id: string;
};

type DeleteTransactionData = {
  deleteTransaction: Transaction;
};

type AddTransactionData = {
  addTransaction: Transaction;
};

type EditTransactionData = {
  editTransaction: Transaction;
};

type EditTransactionVars = {
  id: string;
  amount: number;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  type: TransactionType;
};

type TransactionRow = {
  key: string;
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO
  description?: string | null;
};

type FormValues = {
  amount: number;
  description?: string;
  category: string;
  date: Dayjs;
  type: TransactionType;
};

export function Dashboard() {
  const { Header, Sider, Content, Footer } = Layout;

  const { data, loading, error } =
    useQuery<GetTransactionsData>(GET_TRANSACTIONS);
  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  const [addTransaction, { loading: addTransactionLoading }] = useMutation<
    AddTransactionData,
    AddTransactionVars
  >(ADD_TRANSACTION, {
    update(cache, result) {
      const created = result.data?.addTransaction;
      if (!created) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (existing.some((t) => t.id === created.id)) return prev;
          return { transactions: [created, ...existing] };
        },
      );
    },
  });

  const [editTransaction, { loading: editTransactionLoading }] = useMutation<
    EditTransactionData,
    EditTransactionVars
  >(EDIT_TRANSACTION, {
    update(cache, result) {
      const edited = result.data?.editTransaction;
      if (!edited) return;

      cache.updateQuery<GetTransactionsData>(
        { query: GET_TRANSACTIONS },
        (prev) => {
          const existing = prev?.transactions ?? [];
          if (existing.some((t) => t.id === edited.id)) return prev;
          return {
            transactions: existing.map((t) =>
              t.id === edited.id ? edited : t,
            ),
          };
        },
      );
    },
  });

  const [deleteTransaction, { loading: deleteTransactionLoading }] =
    useMutation<DeleteTransactionData, DeleteTransactionVars>(
      DELETE_TRANSACTION,
      {
        update(cache, result) {
          const deleted = result.data?.deleteTransaction;
          if (!deleted) return;

          cache.updateQuery<GetTransactionsData>(
            { query: GET_TRANSACTIONS },
            (prev) => {
              const existing = prev?.transactions ?? [];
              if (!existing.some((t) => t.id === deleted.id)) return prev;
              return {
                transactions: existing.filter((t) => t.id !== deleted.id),
              };
            },
          );
        },
      },
    );

  const [form] = Form.useForm<FormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  const handleSubmit = async () => {
    const values = await form.validateFields();

    await addTransaction({
      variables: {
        amount: values.amount,
        description: values.description ?? null,
        category: values.category ?? null,
        date: values.date ? values.date.toISOString() : null,
        type: values.type,
      },
    });

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await editTransaction({
      variables: {
        id: editingId,
        amount: Number(values.amount),
        description: values.description ?? null,
        category: values.category ?? null,
        date: values.date ? values.date.toISOString() : null,
        type: values.type,
      },
    });
    form.resetFields();
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingId(null);
  };

  const categories = categoriesData?.categories.map((category) => ({
    label: category.name,
    value: category.id,
    icon: category.icon,
  }));
  const columns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      filterDropdown: () => (
        <div style={{ padding: 8, width: 240 }}>
          <Input
            placeholder="Search description"
            value={descriptionFilter}
            onChange={(e) => setDescriptionFilter(e.target.value)}
            allowClear
          />
        </div>
      ),
      filteredValue: descriptionFilter ? [descriptionFilter] : null,
      onFilter: (value, record) =>
        (record.description ?? "")
          .toLowerCase()
          .includes(String(value).toLowerCase()),
    },
    {
      title: "Transaction Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number) => amount.toFixed(2),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.name.localeCompare(b.category.name),
      render: (category: Category) => (
        <div>
          <span style={{ marginRight: 8 }}>{category.icon}</span>
          <span>{category.name}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 1 }}>
          <Button
            type="link"
            danger
            onClick={() => deleteTransaction({ variables: { id: record.id } })}
            loading={deleteTransactionLoading}
          >
            🗑️
          </Button>
          <Button
            type="link"
            onClick={() => {
              setIsEdit(true);
              setEditingId(record.id);
              form.setFieldsValue({
                amount: Number(record.amount),
                description: record.description,
                category: record.category.id,
                date: dayjs(record.date),
                type: record.type,
              });
              setIsModalOpen(true);
            }}
          >
            ✏️
          </Button>
        </div>
      ),
    },
  ] satisfies TableProps<TransactionRow>["columns"];

  const dataSource: TransactionRow[] = (data?.transactions ?? []).map(
    (transaction) => ({
      key: transaction.id,
      ...transaction,
      date: transaction.date ?? new Date().toISOString(),
      amount: transaction.amount,
      category: transaction.category,
    }),
  );

  return (
    <Layout className="dashboard-shell">
      <Sider
        className="dashboard-sider"
        collapsed={isSiderCollapsed}
        collapsible
        onCollapse={(collapsed) => setIsSiderCollapsed(collapsed)}
        width={240}
      >
        <div className="dashboard-sider__logo">
          <span className="dashboard-sider__logoMark">FD</span>
          {!isSiderCollapsed ? (
            <span className="dashboard-sider__logoText">Finance Dashboard</span>
          ) : null}
        </div>

        <div className="dashboard-sider__nav">
          <button className="dashboard-navItem dashboard-navItem--active">
            <span className="dashboard-navItem__icon" aria-hidden>
              📊
            </span>
            {!isSiderCollapsed ? <span>Dashboard</span> : null}
          </button>
          <button className="dashboard-navItem" disabled>
            <span className="dashboard-navItem__icon" aria-hidden>
              📈
            </span>
            {!isSiderCollapsed ? <span>Reports</span> : null}
          </button>
          <button className="dashboard-navItem" disabled>
            <span className="dashboard-navItem__icon" aria-hidden>
              ⚙️
            </span>
            {!isSiderCollapsed ? <span>Settings</span> : null}
          </button>
        </div>
      </Sider>

      <Layout>
        <Header className="dashboard-header">
          <div className="dashboard-header__left">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Transactions
            </Typography.Title>
            <Typography.Text type="secondary">
              Track income and expenses
            </Typography.Text>
          </div>

          <div className="dashboard-header__right">
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Add transaction
            </Button>
          </div>
        </Header>

        <Content className="dashboard-content">
          <div className="dashboard-contentInner">
            <div className="dashboard-card">
              <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                summary={() => (
                  <Table.Summary.Cell index={0} colSpan={columns.length}>
                    <span>
                      Total: $
                      {dataSource
                        .reduce(
                          (acc, record) =>
                            record.type === "INCOME"
                              ? acc + record.amount
                              : acc - record.amount,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </Table.Summary.Cell>
                )}
                rowClassName={(record) =>
                  record.type === "INCOME"
                    ? "transaction-row--income"
                    : "transaction-row--expense"
                }
              />
            </div>
          </div>
        </Content>

        <Footer className="dashboard-footer">
          <Typography.Text type="secondary">
            © {new Date().getFullYear()} Finance Dashboard
          </Typography.Text>
        </Footer>
      </Layout>

      <Modal
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        open={isModalOpen}
        onOk={isEdit ? handleEdit : handleSubmit}
        confirmLoading={isEdit ? editTransactionLoading : addTransactionLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setEditingId(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Amount is required" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              placeholder="0.00"
              prefix="$"
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input type="text" placeholder="Description" />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select options={categories || []} />
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Date is required" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Type is required" }]}
          >
            <Radio.Group
              options={[
                { label: "INCOME", value: "INCOME" },
                { label: "EXPENSE", value: "EXPENSE" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
