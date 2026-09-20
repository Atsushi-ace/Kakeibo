"use client";

import {
  calculateSettlement,
  formatYen,
} from "@/lib/calculations";
import { FOOD_SHARE, INCOME_SHARE, PEOPLE } from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
}

export function SettlementCard({ expenses }: Props) {
  const s = calculateSettlement(expenses);
  const incomePct = {
    atsushi: Math.round(INCOME_SHARE.atsushi * 100),
    kanoko: Math.round(INCOME_SHARE.kanoko * 100),
  };

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-stone-500">
        負担と精算
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-stone-500">
        基本は収入比（敦史 {incomePct.atsushi}% / かのこ {incomePct.kanoko}%）。
        食費のみ固定（敦史 {Math.round(FOOD_SHARE.atsushi * 10)} : かのこ{" "}
        {Math.round(FOOD_SHARE.kanoko * 10)}）。
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {(["atsushi", "kanoko"] as const).map((id) => {
          const person = PEOPLE[id];
          const over = s.balance[id];
          return (
            <div
              key={id}
              className="rounded-2xl p-3"
              style={{ backgroundColor: `${person.color}14` }}
            >
              <p
                className="mb-2 text-sm font-bold"
                style={{ color: person.color }}
              >
                {person.name}
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-1">
                  <dt className="text-stone-500">実際の支払</dt>
                  <dd className="font-semibold tabular-nums text-stone-800">
                    {formatYen(s.paid[id])}
                  </dd>
                </div>
                <div className="flex justify-between gap-1">
                  <dt className="text-stone-500">本来の負担</dt>
                  <dd className="font-semibold tabular-nums text-stone-800">
                    {formatYen(s.target[id])}
                  </dd>
                </div>
                <div className="flex justify-between gap-1 border-t border-stone-200/80 pt-1.5">
                  <dt className="text-stone-500">差額</dt>
                  <dd
                    className={`font-bold tabular-nums ${
                      over > 0
                        ? "text-teal-700"
                        : over < 0
                          ? "text-orange-700"
                          : "text-stone-600"
                    }`}
                  >
                    {over > 0 ? "+" : ""}
                    {formatYen(over)}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <div
        className={`rounded-2xl px-4 py-4 text-center ${
          s.amount > 0
            ? "bg-amber-50 ring-1 ring-amber-200"
            : "bg-teal-50 ring-1 ring-teal-200"
        }`}
      >
        {s.amount > 0 && s.from && s.to ? (
          <>
            <p className="text-xs font-medium text-amber-800/80">精算の目安</p>
            <p className="mt-1 text-base font-bold leading-snug text-stone-900">
              <span style={{ color: PEOPLE[s.from].color }}>
                {PEOPLE[s.from].name}
              </span>
              が
              <span style={{ color: PEOPLE[s.to].color }}>
                {PEOPLE[s.to].name}
              </span>
              に
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-amber-900">
              {formatYen(s.amount)}
            </p>
            <p className="mt-1 text-xs text-amber-800/80">渡すとバランスします</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-teal-800">精算は不要です</p>
            <p className="mt-1 text-xs text-teal-700/80">
              負担割合どおりに支払われています
            </p>
          </>
        )}
      </div>
    </section>
  );
}
