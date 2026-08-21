import { describe, it, expect } from "vitest";

import { filterTransactions } from "./filterTransactions";
import type { Transaction } from "./types";

// Одна «заглушка»-категория, которую переиспользуем во всех тестах
const category = {
    id: "cat-1",
    name: "Продукты",
    icon: "🍎",
    type: "EXPENSE" as const,
    user_id: null,
    key: null,
};

// Фабрика: создаёт транзакцию с дефолтами, а отдельные поля можно переопределить
function tx(overrides: Partial<Transaction> = {}): Transaction {
    return {
        id: "1",
        amount: 100,
        type: "EXPENSE",
        category,
        date: "2026-08-20",
        description: "Магазин",
        ...overrides,
    };
}

describe("filterTransactions", () => {
    it("возвращает все транзакции при пустых фильтрах", () => {
        const list = [tx({ id: "1" }), tx({ id: "2", amount: 200 })];
        expect(filterTransactions(list, {})).toEqual(list);
    });

    it("фильтрует по категории", () => {
        const list = [
            tx({ id: "1" }),
            tx({ id: "2", category: { ...category, id: "cat-2" } }),
        ];
        const result = filterTransactions(list, { category: "cat-2" });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("2");
    });

    it("фильтрует по типу", () => {
        const list = [tx({ id: "1" }), tx({ id: "2", type: "INCOME" })];
        const result = filterTransactions(list, { type: "INCOME" });
        expect(result.map((t) => t.id)).toEqual(["2"]);
    });

    it("фильтрует по поиску в описании", () => {
        const list = [
            tx({ id: "1", description: "Магазин" }),
            tx({ id: "2", description: "Аптека" }),
        ];
        const result = filterTransactions(list, { search: "магазин" });
        expect(result.map((t) => t.id)).toEqual(["1"]);
    });
});