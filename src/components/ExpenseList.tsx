"use client";

import { formatYen } from "@/lib/calculations";
import { CATEGORY_MAP, PEOPLE } from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
  onRemove: (id: string) => void;
}

export function ExpenseList({ expenses, onRemove }: Props) {
  if (expenses.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-stone-500">
          今月の支出履歴
        </h2>
        <p className="py-6 text-center text-sm text-stone-400">
          まだ支出がありません
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500">
        今月の支出履歴
      </h2>
      <ul className="divide-y divide-stone-100">
        {expenses.map((e) => {
          const cat = CATEGORY_MAP[e.categoryId];
          const person = PEOPLE[e.payer];
          const time = new Date(e.createdAt);
          const label = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;

          return (
            <li
              key={e.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-stone-800">
                    {cat.name}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.name}
                  </span>
                </div>
                {e.note ? (
                  <p className="mt-0.5 truncate text-xs text-stone-600">
                    {e.note}
                  </p>
                ) : null}
                <p className="mt-0.5 text-[11px] text-stone-400">{label}</p>
              </div>
              <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-stone-900">
                {formatYen(e.amount)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(e.id)}
                className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-400 active:bg-stone-100 active:text-red-600"
                aria-label="削除"
              >
                削除
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
