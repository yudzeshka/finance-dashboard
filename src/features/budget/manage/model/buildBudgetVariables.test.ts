import { describe, expect, it } from "vitest";

import { buildBudgetVariables } from "./buildBudgetVariables";

const USD = "USD";

describe("buildBudgetVariables", () => {
  it("конвертирует лимит в USD при валюте приложения USD", () => {
    const result = buildBudgetVariables(
      { categoryId: "cat-1", limit: 100 },
      USD,
      null,
    );

    expect(result).toEqual({ categoryId: "cat-1", limitUsd: 100 });
  });

  it("конвертирует лимит из валюты приложения в USD", () => {
    const result = buildBudgetVariables(
      { categoryId: "cat-1", limit: 200 },
      "EUR",
      { EUR: 0.92, USD: 1, RUB: 90, BYN: 3 },
    );

    // 200 / 0.92 ≈ 217.39
    expect(result.limitUsd).toBeCloseTo(217.39);
  });

  it("сохраняет переданную категорию без изменений (для edit она фиксирована)", () => {
    const result = buildBudgetVariables(
      { categoryId: "fixed-cat", limit: 50 },
      USD,
      null,
    );

    expect(result.categoryId).toBe("fixed-cat");
  });

  it("бросает ошибку при нулевом лимите", () => {
    expect(() =>
      buildBudgetVariables({ categoryId: "cat-1", limit: 0 }, USD, null),
    ).toThrow();
  });

  it("бросает ошибку при отрицательном лимите", () => {
    expect(() =>
      buildBudgetVariables({ categoryId: "cat-1", limit: -10 }, USD, null),
    ).toThrow();
  });

  it("бросает ошибку при нечисловом лимите", () => {
    expect(() =>
      buildBudgetVariables({ categoryId: "cat-1", limit: NaN }, USD, null),
    ).toThrow();
  });

  it("бросает ошибку при пустой категории", () => {
    expect(() =>
      buildBudgetVariables({ categoryId: "", limit: 100 }, USD, null),
    ).toThrow();
  });
});
