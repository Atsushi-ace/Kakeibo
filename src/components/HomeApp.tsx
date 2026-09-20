"use client";

import { useState } from "react";
import { CategoryBudgets } from "@/components/CategoryBudgets";
import { ExpenseList } from "@/components/ExpenseList";
import { MonthlyTrends } from "@/components/MonthlyTrends";
import { QuickExpenseForm } from "@/components/QuickExpenseForm";
import { SavingsForecast } from "@/components/SavingsForecast";
import { SettlementCard } from "@/components/SettlementCard";
import { useExpenses } from "@/hooks/useExpenses";
import { formatYen, totalSpent } from "@/lib/calculations";
import {
  HOUSEHOLD_INCOME,
  MONTHLY_BUDGET_TOTAL,
  PEOPLE,
  TARGET_SAVINGS,
} from "@/lib/constants";

type Tab = "home" | "trend";

export function HomeApp() {
  const {
    expenses,
    monthExpenses,
    hydrated,
    error,
    addExpense,
    removeExpense,
    month,
  } = useExpenses();
  const [tab, setTab] = useState<Tab>("home");

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-100 text-stone-500">
        読み込み中…
      </div>
    );
  }

  const spent = totalSpent(monthExpenses);
  const [y, m] = month.split("-");

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_#e7f3f1_0%,_#f5f5f4_45%,_#ebe8e2_100%)]">
      <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-white/85 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] font-medium tracking-widest text-teal-700/80">
            KANEKO × ATSUSHI
          </p>
          <div className="mt-0.5 flex items-end justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              ふたり家計
            </h1>
            <p className="pb-0.5 text-sm font-medium tabular-nums text-stone-500">
              {y}年{Number(m)}月
            </p>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 text-[11px]">
            <StatChip label="収入" value={formatYen(HOUSEHOLD_INCOME)} />
            <StatChip label="予算" value={formatYen(MONTHLY_BUDGET_TOTAL)} />
            <StatChip
              label="支出"
              value={formatYen(spent)}
              accent={spent > MONTHLY_BUDGET_TOTAL * 0.8}
            />
            <StatChip label="貯金目標" value={formatYen(TARGET_SAVINGS)} />
          </div>
          <p className="mt-2 text-[10px] text-stone-400">
            {PEOPLE.atsushi.name} {formatYen(PEOPLE.atsushi.income)} ·{" "}
            {PEOPLE.kanoko.name} {formatYen(PEOPLE.kanoko.income)}
            {" · "}クラウド同期中
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            同期エラー: {error}
          </div>
        )}
        {tab === "home" ? (
          <>
            <QuickExpenseForm onAdd={addExpense} />
            <SavingsForecast expenses={monthExpenses} />
            <SettlementCard expenses={monthExpenses} />
            <CategoryBudgets expenses={monthExpenses} />
            <ExpenseList expenses={monthExpenses} onRemove={removeExpense} />
          </>
        ) : (
          <MonthlyTrends expenses={expenses} />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-2">
          <TabButton
            active={tab === "home"}
            label="今月"
            onClick={() => setTab("home")}
          />
          <TabButton
            active={tab === "trend"}
            label="推移"
            onClick={() => setTab("trend")}
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 flex-col items-center justify-center text-sm font-semibold ${
        active ? "text-teal-800" : "text-stone-400 active:bg-stone-50"
      }`}
    >
      <span
        className={`mb-0.5 h-1 w-8 rounded-full ${
          active ? "bg-teal-700" : "bg-transparent"
        }`}
      />
      {label}
    </button>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 font-medium ${
        accent
          ? "bg-orange-100 text-orange-800"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      {label}{" "}
      <span className="tabular-nums font-semibold text-stone-800">{value}</span>
    </span>
  );
}
