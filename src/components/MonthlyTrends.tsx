"use client";

import { useMemo, useState } from "react";
import {
  averageMonthlySpend,
  buildMonthlyTrend,
  formatMonthLabel,
  formatMonthShort,
  formatYen,
  type MonthSummary,
} from "@/lib/calculations";
import {
  CATEGORIES,
  HOUSEHOLD_INCOME,
  MONTHLY_BUDGET_TOTAL,
  PEOPLE,
  TARGET_SAVINGS,
} from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
}

type Range = 6 | 12;

export function MonthlyTrends({ expenses }: Props) {
  const [range, setRange] = useState<Range>(6);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const trend = useMemo(
    () => buildMonthlyTrend(expenses, range),
    [expenses, range],
  );

  const selected =
    trend.find((t) => t.month === selectedMonth) ??
    trend.find((t) => t.isCurrent) ??
    trend[trend.length - 1];

  const maxBar = Math.max(
    MONTHLY_BUDGET_TOTAL,
    ...trend.map((t) => t.spent),
    1,
  );
  const avgSpend = averageMonthlySpend(trend);
  const avgSavings = (() => {
    const withData = trend.filter((t) => t.expenseCount > 0);
    if (withData.length === 0) return 0;
    return Math.round(
      withData.reduce((s, t) => s + t.savings, 0) / withData.length,
    );
  })();
  const totalSaved = trend.reduce((s, t) => s + t.savings, 0);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-stone-500">
            月次の推移
          </h2>
          <div className="flex rounded-full bg-stone-100 p-0.5 text-xs font-semibold">
            {([6, 12] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setRange(n);
                  setSelectedMonth(null);
                }}
                className={`rounded-full px-3 py-1.5 ${
                  range === n
                    ? "bg-teal-700 text-white"
                    : "text-stone-500 active:bg-stone-200"
                }`}
              >
                {n}か月
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="平均支出" value={formatYen(avgSpend)} />
          <MiniStat label="平均貯金" value={formatYen(avgSavings)} />
          <MiniStat label={`${range}か月貯金計`} value={formatYen(totalSaved)} />
        </div>

        <div className="flex h-44 items-end gap-1.5 sm:gap-2">
          {trend.map((t) => {
            const height = Math.max((t.spent / maxBar) * 100, t.spent > 0 ? 4 : 0);
            const budgetHeight = (MONTHLY_BUDGET_TOTAL / maxBar) * 100;
            const active = selected?.month === t.month;
            const over = t.spent > MONTHLY_BUDGET_TOTAL;

            return (
              <button
                key={t.month}
                type="button"
                onClick={() => setSelectedMonth(t.month)}
                className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                aria-pressed={active}
              >
                <div className="relative flex h-36 w-full items-end justify-center">
                  <div
                    className="absolute inset-x-0 border-t border-dashed border-stone-300"
                    style={{ bottom: `${budgetHeight}%` }}
                    title="予算"
                  />
                  <div
                    className={`w-full max-w-8 rounded-t-md transition ${
                      over
                        ? "bg-orange-500"
                        : t.isCurrent
                          ? "bg-teal-600"
                          : "bg-teal-700/70"
                    } ${active ? "ring-2 ring-teal-900 ring-offset-1" : ""}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-medium ${
                    active ? "text-teal-800" : "text-stone-500"
                  }`}
                >
                  {formatMonthShort(t.month)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[10px] text-stone-400">
          点線 = 月間予算 {formatYen(MONTHLY_BUDGET_TOTAL)} · 棒をタップで詳細
        </p>
      </div>

      {selected && <MonthDetail summary={selected} />}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 px-2 py-2.5">
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className="mt-0.5 text-xs font-bold tabular-nums text-stone-800">
        {value}
      </p>
    </div>
  );
}

function MonthDetail({ summary }: { summary: MonthSummary }) {
  const topCategories = CATEGORIES.map((c) => ({
    ...c,
    spent: summary.byCategory[c.id] ?? 0,
  }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const vsTarget = summary.savings - TARGET_SAVINGS;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-stone-900">
          {formatMonthLabel(summary.month)}
          {summary.isCurrent && (
            <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
              今月
            </span>
          )}
        </h3>
        <span className="text-xs text-stone-400">
          {summary.expenseCount}件
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <DetailTile
          label="支出合計"
          value={formatYen(summary.spent)}
          tone={summary.spent > summary.budget ? "warn" : "default"}
        />
        <DetailTile label="予算" value={formatYen(summary.budget)} />
        <DetailTile
          label="予算との差"
          value={`${summary.vsBudget >= 0 ? "+" : ""}${formatYen(summary.vsBudget)}`}
          tone={summary.vsBudget >= 0 ? "good" : "warn"}
        />
        <DetailTile
          label="貯金（見込み）"
          value={formatYen(summary.savings)}
          tone={vsTarget >= 0 ? "good" : "warn"}
        />
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-stone-500">
        世帯収入 {formatYen(HOUSEHOLD_INCOME)} − 支出 = 手元{" "}
        {formatYen(summary.leftover)} → その50%を貯金見込み。目標{" "}
        {formatYen(TARGET_SAVINGS)} との差は{" "}
        <span className={vsTarget >= 0 ? "text-teal-700" : "text-orange-700"}>
          {vsTarget >= 0 ? "+" : ""}
          {formatYen(vsTarget)}
        </span>
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {(["atsushi", "kanoko"] as const).map((id) => (
          <div
            key={id}
            className="rounded-2xl p-3"
            style={{ backgroundColor: `${PEOPLE[id].color}14` }}
          >
            <p
              className="text-xs font-bold"
              style={{ color: PEOPLE[id].color }}
            >
              {PEOPLE[id].name}の支払
            </p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-stone-900">
              {formatYen(summary.paid[id])}
            </p>
          </div>
        ))}
      </div>

      <h4 className="mb-2 text-xs font-semibold tracking-wide text-stone-500">
        カテゴリ上位
      </h4>
      {topCategories.length === 0 ? (
        <p className="py-4 text-center text-sm text-stone-400">
          この月の支出データはありません
        </p>
      ) : (
        <ul className="space-y-2">
          {topCategories.map((c) => {
            const ratio = c.budget > 0 ? c.spent / c.budget : 0;
            return (
              <li key={c.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-stone-700">{c.name}</span>
                  <span className="tabular-nums text-stone-600">
                    {formatYen(c.spent)}
                    <span className="text-stone-400">
                      {" "}
                      / {formatYen(c.budget)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${
                      ratio >= 1
                        ? "bg-red-500"
                        : ratio >= 0.8
                          ? "bg-orange-500"
                          : "bg-teal-600"
                    }`}
                    style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DetailTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn";
}) {
  const valueClass =
    tone === "good"
      ? "text-teal-800"
      : tone === "warn"
        ? "text-orange-800"
        : "text-stone-900";

  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className={`mt-1 text-sm font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
