import { describe, expect, it } from "vitest";
import { currencySymbol, displayToUsd, getRate, usdToDisplay } from "./convert";
import { formatAmount, formatAmountNumber } from "./format";

const RATES = { USD: 1, RUB: 85, EUR: 0.85, BYN: 3.0 };

describe("usdToDisplay", () => {
  it("passes through USD", () => {
    expect(usdToDisplay(100, "USD", RATES)).toBe(100);
  });
  it("converts USD to RUB", () => {
    expect(usdToDisplay(1, "RUB", RATES)).toBe(85);
  });
  it("converts USD to EUR", () => {
    expect(usdToDisplay(100, "EUR", RATES)).toBeCloseTo(85);
  });
  it("falls back to passthrough when rates are null", () => {
    expect(usdToDisplay(50, "RUB", null)).toBe(50);
  });
});

describe("displayToUsd", () => {
  it("passes through USD", () => {
    expect(displayToUsd(100, "USD", RATES)).toBe(100);
  });
  it("converts RUB to USD", () => {
    expect(displayToUsd(85, "RUB", RATES)).toBe(1);
  });
  it("rounds to 2 decimals", () => {
    expect(displayToUsd(1, "RUB", RATES)).toBe(0.01);
  });
  it("falls back to passthrough when rates are null", () => {
    expect(displayToUsd(85, "RUB", null)).toBe(85);
  });
});

describe("getRate", () => {
  it("returns 1 without rates", () => {
    expect(getRate("RUB", null)).toBe(1);
  });
});

describe("currencySymbol", () => {
  it("maps currency codes to symbols", () => {
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("RUB")).toBe("₽");
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("BYN")).toBe("Br");
  });
});

describe("formatAmount", () => {
  it("formats USD with $", () => {
    expect(formatAmount(100, "USD", RATES)).toContain("$");
  });
  it("formats converted RUB with ₽", () => {
    expect(formatAmount(1, "RUB", RATES)).toContain("₽");
  });
});

describe("formatAmountNumber", () => {
  it("rounds to 2 decimals", () => {
    expect(formatAmountNumber(1234.567)).toBe("1234.57");
  });
  it("drops trailing .00 for whole numbers", () => {
    expect(formatAmountNumber(85)).toBe("85");
  });
  it("keeps a single non-zero decimal", () => {
    expect(formatAmountNumber(85.5)).toBe("85.5");
  });
});
