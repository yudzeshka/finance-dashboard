import { createSchema } from "graphql-yoga";

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
  date: string;
  description?: string;
};

const categories: Category[] = [
  { id: "c1", name: "Food & Drinks", icon: "🍔" },
  { id: "c2", name: "Salary", icon: "💰" },
  { id: "c3", name: "Transport", icon: "🚗" },
  { id: "c4", name: "Entertainment", icon: "🎉" },
  { id: "c5", name: "Health", icon: "💪" },
  { id: "c6", name: "Education", icon: "🎓" },
  { id: "c7", name: "Utilities", icon: "🔌" },
  { id: "c8", name: "Rent", icon: "🏠" },
  { id: "c9", name: "Mortgage", icon: "🏠" },
  { id: "c10", name: "Loan", icon: "💳" },
  { id: "c11", name: "Credit Card", icon: "💳" },
  { id: "c12", name: "Debt", icon: "💳" },
  { id: "c13", name: "Insurance", icon: "💳" },
  { id: "c14", name: "Taxes", icon: "💵" },
  { id: "c15", name: "Other", icon: "💵" },
];

const transactions: Transaction[] = [
  {
    id: "t1",
    amount: 42.5,
    type: "EXPENSE",
    category: categories[0],
    date: new Date().toISOString(),
    description: "Mock coffee",
  },
  {
    id: "t2",
    amount: 2500,
    type: "INCOME",
    category: categories[1],
    date: new Date(Date.now() - 86400_000).toISOString(),
    description: "Mock salary",
  },
];

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    enum TransactionType {
      INCOME
      EXPENSE
    }

    type Category {
      id: ID!
      name: String!
      icon: String!
    }

    type Transaction {
      id: ID!
      amount: Float!
      type: TransactionType!
      category: Category!
      date: String!
      description: String
    }

    type Query {
      transactions: [Transaction!]!
      categories: [Category!]!
    }

    type Mutation {
      addTransaction(
        amount: Float!
        type: TransactionType!
        category: String
        date: String
        description: String
      ): Transaction!
      editTransaction(
        id: ID!
        amount: Float!
        type: TransactionType!
        category: String
        date: String
        description: String
      ): Transaction!
      deleteTransaction(id: ID!): Transaction!
    }
  `,
  resolvers: {
    Query: {
      transactions: () => transactions,
      categories: () => categories,
    },
    Mutation: {
      addTransaction: (
        _parent,
        args: {
          amount: number;
          type: TransactionType;
          category?: string | null;
          date?: string | null;
          description?: string | null;
        },
      ) => {
        const category =
          categories.find(
            (c) => c.id === args.category || c.name === args.category,
          ) ?? categories[0];

        const t: Transaction = {
          id: `t${transactions.length + 1}`,
          amount: args.amount,
          type: args.type,
          category,
          date: args.date ?? new Date().toISOString(),
          description: args.description ?? undefined,
        };
        transactions.unshift(t);
        return t;
      },
      deleteTransaction: (
        _parent,
        args: {
          id: string;
        },
      ) => {
        const transaction = transactions.find((t) => t.id === args.id);
        if (!transaction) {
          throw new Error("Transaction not found");
        }
        transactions.splice(transactions.indexOf(transaction), 1);
        return transaction;
      },
      editTransaction: (
        _parent,
        args: {
          id: string;
          amount: number;
          type: TransactionType;
          category?: string | null;
          date?: string | null;
          description?: string | null;
        },
      ) => {
        const transaction = transactions.find((t) => t.id === args.id);
        if (!transaction) {
          throw new Error("Transaction not found");
        }
        transaction.amount = args.amount;
        transaction.type = args.type;
        transaction.category =
          categories.find((c) => c.id === args.category) ?? categories[0];
        transaction.date = args.date ?? new Date().toISOString();
        transaction.description = args.description ?? undefined;
        return transaction;
      },
    },
  },
});
