import { describe, expect, it } from "vitest";
import type { Category } from "@/entities/category";
import type { Transaction } from "@/entities/transaction";
import { calculateBudgetProgress } from "./calculateBudgetProgress";
import type { Budget } from "./types";

// 15 сентября 2026 (локально) — точка отсчёта для «текущего месяца».
const REFERENCE = new Date(2026, 8, 15);

function category(id: string, overrides: Partial<Category> = {}): Category {
  return {
    id,
    name: "Category",
    icon: "🍔",
    type: "EXPENSE",
    user_id: null,
    key: null,
    ...overrides,
  };
}

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    amount: 100,
    type: "EXPENSE",
    category: category("cat1"),
    date: "2026-09-10T12:00:00",
    description: null,
    ...overrides,
  };
}

function budget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: "b1",
    category_id: "cat1",
    limit_usd: 1000,
    category: category("cat1"),
    ...overrides,
  };
}

describe("calculateBudgetProgress", () => {
  it("суммирует только EXPENSE-транзакции своей категории за текущий месяц", () => {
    const transactions = [
      transaction({ amount: 100 }),
      transaction({ amount: 200, id: "t2" }),
      transaction({ amount: 999, id: "t3", type: "INCOME" }),
      transaction({ amount: 500, id: "t4", category: category("cat2") }),
      transaction({ amount: 777, id: "t5", date: "2026-08-10T12:00:00" }),
      transaction({ amount: 888, id: "t6", date: "2025-09-10T12:00:00" }),
    ];

    const result = calculateBudgetProgress([budget()], transactions, REFERENCE);

    expect(result).toHaveLength(1);
    expect(result[0].spent).toBe(300);
  });

  it("игнорирует транзакции без даты", () => {
    const transactions = [
      transaction({ amount: 100 }),
      transaction({ amount: 200, id: "t2", date: null }),
    ];

    const result = calculateBudgetProgress([budget()], transactions, REFERENCE);

    expect(result[0].spent).toBe(100);
  });

  it("считает ratio и remaining", () => {
    const transactions = [transaction({ amount: 250 })];

    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      transactions,
      REFERENCE,
    );

    expect(result[0].ratio).toBe(0.25);
    expect(result[0].remaining).toBe(750);
  });

  it("статус ok при ratio < 0.8", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      [transaction({ amount: 700 })],
      REFERENCE,
    );
    expect(result[0].status).toBe("ok");
  });

  it("статус warning на границе 0.8", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      [transaction({ amount: 800 })],
      REFERENCE,
    );
    expect(result[0].status).toBe("warning");
  });

  it("статус warning при ratio от 0.8 до 1", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      [transaction({ amount: 999 })],
      REFERENCE,
    );
    expect(result[0].status).toBe("warning");
  });

  it("статус danger на границе 1.0", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      [transaction({ amount: 1000 })],
      REFERENCE,
    );
    expect(result[0].status).toBe("danger");
  });

  it("статус danger при перерасходе и отрицательный remaining", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 1000 })],
      [transaction({ amount: 1300 })],
      REFERENCE,
    );
    expect(result[0].status).toBe("danger");
    expect(result[0].remaining).toBe(-300);
  });

  it("обрабатывает несколько бюджетов независимо", () => {
    const transactions = [
      transaction({ amount: 100 }), // cat1
      transaction({ amount: 400, id: "t2", category: category("cat2") }), // cat2
    ];

    const result = calculateBudgetProgress(
      [
        budget({ id: "b1", category_id: "cat1", limit_usd: 500 }),
        budget({ id: "b2", category_id: "cat2", limit_usd: 1000 }),
      ],
      transactions,
      REFERENCE,
    );

    expect(result).toHaveLength(2);
    expect(result[0].spent).toBe(100);
    expect(result[0].status).toBe("ok");
    expect(result[1].spent).toBe(400);
    expect(result[1].status).toBe("ok");
  });

  it("защищается от нулевого/отрицательного лимита", () => {
    const result = calculateBudgetProgress(
      [budget({ limit_usd: 0 })],
      [transaction({ amount: 100 })],
      REFERENCE,
    );
    expect(result[0].ratio).toBe(0);
    expect(result[0].status).toBe("ok");
  });
});
