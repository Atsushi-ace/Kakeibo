"use client";

import {
  formatYen,
  spentByCategory,
} from "@/lib/calculations";
import {
  CATEGORIES,
  WARNING_THRESHOLD,
} from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
}

function barColor(ratio: number): string {
  if (ratio >= 1) return "bg-red-500";
  if (ratio >= WARNING_THRESHOLD) return "bg-orange-500";
  return "bg-teal-600";
}

function textColor(ratio: number): string {
  if (ratio >= 1) return "text-red-700";
  if (ratio >= WARNING_THRESHOLD) return "text-orange-700";
  return "text-stone-600";
}

export function CategoryBudgets({ expenses }: Props) {
  const spent = spentByCategory(expenses);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500">
        カテゴリ別・あと使える額
      </h2>
      <ul className="space-y-3">
        {CATEGORIES.map((cat) => {
          const used = spent[cat.id];
          const remaining = cat.budget - used;
          const ratio = cat.budget > 0 ? used / cat.budget : 0;
          const pct = Math.min(ratio * 100, 100);

          return (
            <li
              key={cat.id}
              className={`rounded-2xl p-3 ${
                ratio >= WARNING_THRESHOLD
                  ? ratio >= 1
                    ? "bg-red-50 ring-1 ring-red-200"
                    : "bg-orange-50 ring-1 ring-orange-200"
                  : "bg-stone-50"
              }`}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  {cat.name}
                </span>
                <span className={`text-sm font-bold tabular-nums ${textColor(ratio)}`}>
                  あと {formatYen(remaining)}
                </span>
              </div>
              <div className="mb-1 h-2.5 overflow-hidden rounded-full bg-stone-200/80">
                <div
                  className={`h-full rounded-full transition-all ${barColor(ratio)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] tabular-nums text-stone-500">
                <span>
                  {formatYen(used)} / {formatYen(cat.budget)}
                </span>
                <span>{Math.round(ratio * 100)}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
