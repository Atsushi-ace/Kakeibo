import {
  CATEGORIES,
  CATEGORY_MAP,
  FOOD_SHARE,
  HOUSEHOLD_INCOME,
  INCOME_SHARE,
  MONTHLY_BUDGET_TOTAL,
  TARGET_SAVINGS,
} from "./constants";
import type { CategoryId, Expense, PersonId } from "./types";

export function currentMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** input[type=date] 用の YYYY-MM-DD（ローカル日付） */
export function toDateInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD をローカル時刻つき ISO に変換 */
export function dateInputToIso(dateStr: string, base = new Date()): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return base.toISOString();
  const local = new Date(
    y,
    m - 1,
    d,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
  );
  return local.toISOString();
}

/** YYYY-MM-DD から month キーを作る */
export function monthKeyFromDateInput(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  if (!y || !m) return currentMonthKey();
  return `${y}-${m}`;
}

export function formatYen(amount: number): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded).toLocaleString("ja-JP");
  return rounded < 0 ? `-¥${abs}` : `¥${abs}`;
}

export function shareForCategory(
  categoryId: CategoryId,
  person: PersonId,
): number {
  const category = CATEGORY_MAP[categoryId];
  if (category.split === "food") return FOOD_SHARE[person];
  return INCOME_SHARE[person];
}

export function filterMonthExpenses(
  expenses: Expense[],
  month = currentMonthKey(),
): Expense[] {
  return expenses.filter((e) => e.month === month);
}

export function spentByCategory(
  expenses: Expense[],
): Record<CategoryId, number> {
  const result = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, 0]),
  ) as Record<CategoryId, number>;

  for (const e of expenses) {
    result[e.categoryId] += e.amount;
  }
  return result;
}

export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function paidByPerson(
  expenses: Expense[],
): Record<PersonId, number> {
  return {
    atsushi: expenses
      .filter((e) => e.payer === "atsushi")
      .reduce((s, e) => s + e.amount, 0),
    kanoko: expenses
      .filter((e) => e.payer === "kanoko")
      .reduce((s, e) => s + e.amount, 0),
  };
}

export function targetBurdenByPerson(
  expenses: Expense[],
): Record<PersonId, number> {
  const result: Record<PersonId, number> = { atsushi: 0, kanoko: 0 };
  for (const e of expenses) {
    result.atsushi += e.amount * shareForCategory(e.categoryId, "atsushi");
    result.kanoko += e.amount * shareForCategory(e.categoryId, "kanoko");
  }
  return result;
}

export interface SettlementResult {
  paid: Record<PersonId, number>;
  target: Record<PersonId, number>;
  /** 正ならその人が多く払っている（受け取る側） */
  balance: Record<PersonId, number>;
  /** 渡す人 → 受け取る人への金額。0なら精算不要 */
  from: PersonId | null;
  to: PersonId | null;
  amount: number;
}

export function calculateSettlement(expenses: Expense[]): SettlementResult {
  const paid = paidByPerson(expenses);
  const target = targetBurdenByPerson(expenses);
  const balance: Record<PersonId, number> = {
    atsushi: paid.atsushi - target.atsushi,
    kanoko: paid.kanoko - target.kanoko,
  };

  // balance が大きい方が受け取り側
  const amount = Math.round(Math.abs(balance.atsushi));
  if (amount < 1) {
    return { paid, target, balance, from: null, to: null, amount: 0 };
  }

  if (balance.atsushi > 0) {
    return {
      paid,
      target,
      balance,
      from: "kanoko",
      to: "atsushi",
      amount,
    };
  }
  return {
    paid,
    target,
    balance,
    from: "atsushi",
    to: "kanoko",
    amount,
  };
}

export interface SavingsForecast {
  spent: number;
  budget: number;
  dayOfMonth: number;
  daysInMonth: number;
  /** 現状ペースで月末に着地する支出見込み */
  projectedSpend: number;
  /** 月末に手元に残りそうな額 */
  projectedLeftover: number;
  /** 手元残りの50%を貯金に回した場合の見込み */
  projectedSavings: number;
  targetSavings: number;
  /** 予算どおりに使った場合との差（プラス＝抑えられている） */
  underBudget: number;
  paceRatio: number;
}

export function calculateSavingsForecast(
  expenses: Expense[],
  now = new Date(),
): SavingsForecast {
  const spent = totalSpent(expenses);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  // 1日目でもペース計算できるよう下限を1に
  const elapsed = Math.max(dayOfMonth, 1);
  const projectedSpend = Math.round((spent / elapsed) * daysInMonth);
  const projectedLeftover = HOUSEHOLD_INCOME - projectedSpend;
  const projectedSavings = Math.max(0, Math.round(projectedLeftover * 0.5));
  const underBudget = MONTHLY_BUDGET_TOTAL - spent;
  const expectedByNow = (MONTHLY_BUDGET_TOTAL / daysInMonth) * elapsed;
  const paceRatio = expectedByNow > 0 ? spent / expectedByNow : 0;

  return {
    spent,
    budget: MONTHLY_BUDGET_TOTAL,
    dayOfMonth,
    daysInMonth,
    projectedSpend,
    projectedLeftover,
    projectedSavings,
    targetSavings: TARGET_SAVINGS,
    underBudget,
    paceRatio,
  };
}

export function daysLeftInMonth(now = new Date()): number {
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  return Math.max(daysInMonth - now.getDate(), 0);
}

export function shiftMonthKey(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonthKey(d);
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}年${Number(m)}月`;
}

export function formatMonthShort(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}月`;
}

export interface MonthSummary {
  month: string;
  spent: number;
  budget: number;
  leftover: number;
  /** 手元残りの50%（マイナス支出超過時は0） */
  savings: number;
  paid: Record<PersonId, number>;
  byCategory: Record<CategoryId, number>;
  expenseCount: number;
  vsBudget: number;
  isCurrent: boolean;
}

export function summarizeMonth(
  expenses: Expense[],
  month: string,
  current = currentMonthKey(),
): MonthSummary {
  const monthExpenses = filterMonthExpenses(expenses, month);
  const spent = totalSpent(monthExpenses);
  const leftover = HOUSEHOLD_INCOME - spent;
  return {
    month,
    spent,
    budget: MONTHLY_BUDGET_TOTAL,
    leftover,
    savings: Math.max(0, Math.round(leftover * 0.5)),
    paid: paidByPerson(monthExpenses),
    byCategory: spentByCategory(monthExpenses),
    expenseCount: monthExpenses.length,
    vsBudget: MONTHLY_BUDGET_TOTAL - spent,
    isCurrent: month === current,
  };
}

/** 直近 months か月分（古い→新しい）。データがない月も含める */
export function buildMonthlyTrend(
  expenses: Expense[],
  months = 6,
  endMonth = currentMonthKey(),
): MonthSummary[] {
  const result: MonthSummary[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const key = shiftMonthKey(endMonth, -i);
    result.push(summarizeMonth(expenses, key, endMonth));
  }
  return result;
}

export function averageMonthlySpend(summaries: MonthSummary[]): number {
  const withData = summaries.filter((s) => s.expenseCount > 0);
  if (withData.length === 0) return 0;
  return Math.round(
    withData.reduce((sum, s) => sum + s.spent, 0) / withData.length,
  );
}
