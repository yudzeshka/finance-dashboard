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
  // Jan
  {
    id: "t3",
    amount: 1200,
    type: "INCOME",
    category: categories[1],
    date: new Date("2026-01-05T10:00:00.000Z").toISOString(),
    description: "January salary",
  },
  {
    id: "t4",
    amount: 18.9,
    type: "EXPENSE",
    category: categories[0],
    date: new Date("2026-01-07T08:20:00.000Z").toISOString(),
    description: "Breakfast",
  },
  {
    id: "t5",
    amount: 45.2,
    type: "EXPENSE",
    category: categories[2],
    date: new Date("2026-01-12T17:40:00.000Z").toISOString(),
    description: "Taxi",
  },
  {
    id: "t6",
    amount: 320,
    type: "EXPENSE",
    category: categories[7],
    date: new Date("2026-01-25T12:00:00.000Z").toISOString(),
    description: "Rent",
  },
  // Feb
  {
    id: "t7",
    amount: 1200,
    type: "INCOME",
    category: categories[1],
    date: new Date("2026-02-05T10:00:00.000Z").toISOString(),
    description: "February salary",
  },
  {
    id: "t8",
    amount: 27.35,
    type: "EXPENSE",
    category: categories[0],
    date: new Date("2026-02-06T09:10:00.000Z").toISOString(),
    description: "Groceries",
  },
  {
    id: "t9",
    amount: 12.5,
    type: "EXPENSE",
    category: categories[6],
    date: new Date("2026-02-10T19:00:00.000Z").toISOString(),
    description: "Electricity bill",
  },
  {
    id: "t10",
    amount: 60,
    type: "EXPENSE",
    category: categories[3],
    date: new Date("2026-02-21T20:00:00.000Z").toISOString(),
    description: "Cinema",
  },
  // Mar
  {
    id: "t11",
    amount: 1250,
    type: "INCOME",
    category: categories[1],
    date: new Date("2026-03-05T10:00:00.000Z").toISOString(),
    description: "March salary",
  },
  {
    id: "t12",
    amount: 33.4,
    type: "EXPENSE",
    category: categories[0],
    date: new Date("2026-03-09T18:15:00.000Z").toISOString(),
    description: "Lunch",
  },
  {
    id: "t13",
    amount: 22,
    type: "EXPENSE",
    category: categories[4],
    date: new Date("2026-03-12T07:30:00.000Z").toISOString(),
    description: "Pharmacy",
  },
  {
    id: "t14",
    amount: 15,
    type: "EXPENSE",
    category: categories[2],
    date: new Date("2026-03-20T16:45:00.000Z").toISOString(),
    description: "Bus pass",
  },
  // Apr
  {
    id: "t15",
    amount: 1250,
    type: "INCOME",
    category: categories[1],
    date: new Date("2026-04-05T10:00:00.000Z").toISOString(),
    description: "April salary",
  },
  {
    id: "t16",
    amount: 40,
    type: "EXPENSE",
    category: categories[0],
    date: new Date("2026-04-06T11:25:00.000Z").toISOString(),
    description: "Groceries",
  },
  {
    id: "t17",
    amount: 85,
    type: "EXPENSE",
    category: categories[3],
    date: new Date("2026-04-14T21:00:00.000Z").toISOString(),
    description: "Concert",
  },
  {
    id: "t18",
    amount: 19.99,
    type: "EXPENSE",
    category: categories[5],
    date: new Date("2026-04-19T13:00:00.000Z").toISOString(),
    description: "Online course",
  },
];

function normalizeDateToIso(input?: string | null): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

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
          date: normalizeDateToIso(args.date),
          description: args.description ?? undefined,
        };
        transactions.unshift(t);
        return t;
      },
      deleteTransaction: (_parent, args: { id: string }) => {
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
        transaction.date = normalizeDateToIso(args.date);
        transaction.description = args.description ?? undefined;
        return transaction;
      },
    },
  },
});

