"use client";

import {
  calculateSavingsForecast,
  formatYen,
} from "@/lib/calculations";
import { HOUSEHOLD_INCOME, TARGET_SAVINGS } from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
}

export function SavingsForecast({ expenses }: Props) {
  const f = calculateSavingsForecast(expenses);
  const vsTarget = f.projectedSavings - f.targetSavings;
  const onTrack = f.paceRatio <= 1.05;

  return (
    <section className="rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 p-4 text-white shadow-sm">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-teal-200">
        貯金見込みシミュレーション
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-teal-100/80">
        今月の支出ペースから、月末着地で貯金に回せそうな額（手元残りの50%）を推計します。
      </p>

      <div className="mb-4 rounded-2xl bg-white/10 px-4 py-4 text-center backdrop-blur-sm">
        <p className="text-xs text-teal-100">今月末の貯金見込み</p>
        <p className="mt-1 font-mono text-4xl font-bold tabular-nums tracking-tight">
          {formatYen(f.projectedSavings)}
        </p>
        <p
          className={`mt-2 text-sm font-medium ${
            vsTarget >= 0 ? "text-emerald-300" : "text-orange-300"
          }`}
        >
          目標 {formatYen(TARGET_SAVINGS)} に対して{" "}
          {vsTarget >= 0 ? "+" : ""}
          {formatYen(vsTarget)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/10 p-3">
          <dt className="text-teal-200">今月の支出</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums">
            {formatYen(f.spent)}
          </dd>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <dt className="text-teal-200">月末支出見込み</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums">
            {formatYen(f.projectedSpend)}
          </dd>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <dt className="text-teal-200">月間予算</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums">
            {formatYen(f.budget)}
          </dd>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <dt className="text-teal-200">世帯収入</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums">
            {formatYen(HOUSEHOLD_INCOME)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-center text-xs text-teal-100/90">
        {onTrack
          ? `支出ペース良好（予定の ${Math.round(f.paceRatio * 100)}%）· ${f.dayOfMonth}/${f.daysInMonth}日`
          : `支出ペースが速め（予定の ${Math.round(f.paceRatio * 100)}%）· ${f.dayOfMonth}/${f.daysInMonth}日`}
      </p>
    </section>
  );
}
