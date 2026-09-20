"use client";

import { useState } from "react";
import { CATEGORIES, PEOPLE } from "@/lib/constants";
import type { CategoryId, PersonId } from "@/lib/types";

interface Props {
  onAdd: (input: {
    amount: number;
    categoryId: CategoryId;
    payer: PersonId;
    note: string;
  }) => void;
}

const QUICK_AMOUNTS = [500, 1000, 1500, 2000, 3000, 5000];

export function QuickExpenseForm({ onAdd }: Props) {
  const [digits, setDigits] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("food");
  const [payer, setPayer] = useState<PersonId>("kanoko");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState(false);

  const amount = digits === "" ? 0 : Number(digits);

  function appendDigit(d: string) {
    setDigits((prev) => {
      if (prev.length >= 7) return prev;
      if (prev === "0") return d;
      return prev + d;
    });
  }

  function backspace() {
    setDigits((prev) => prev.slice(0, -1));
  }

  function clearAmount() {
    setDigits("");
  }

  function submit() {
    if (amount <= 0) return;
    onAdd({ amount, categoryId, payer, note });
    setDigits("");
    setNote("");
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-stone-500">
          すぐ登録
        </h2>
        {flash && (
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
            登録しました
          </span>
        )}
      </div>

      <div className="mb-3 flex h-16 items-center justify-end rounded-2xl bg-stone-50 px-4 ring-1 ring-inset ring-stone-200">
        <span className="mr-1 text-lg text-stone-400">¥</span>
        <span className="font-mono text-4xl font-semibold tracking-tight text-stone-900 tabular-nums">
          {amount > 0 ? amount.toLocaleString("ja-JP") : "0"}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setDigits(String(q))}
            className="rounded-xl bg-stone-100 py-2.5 text-sm font-medium text-stone-700 active:bg-stone-200"
          >
            ¥{q.toLocaleString("ja-JP")}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === "C") clearAmount();
                else if (key === "⌫") backspace();
                else appendDigit(key);
              }}
              className="h-12 rounded-xl bg-stone-100 text-xl font-semibold text-stone-800 active:scale-[0.98] active:bg-stone-200"
            >
              {key}
            </button>
          ),
        )}
      </div>

      <label className="mb-1 block text-xs font-medium text-stone-500">
        カテゴリ
      </label>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        className="mb-3 h-12 w-full appearance-none rounded-2xl bg-stone-50 px-4 text-base font-medium text-stone-900 ring-1 ring-inset ring-stone-200"
      >
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-xs font-medium text-stone-500">
        詳細（任意）
      </label>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="例: スーパーの食材、映画チケット"
        maxLength={80}
        enterKeyHint="done"
        className="mb-3 h-12 w-full rounded-2xl bg-stone-50 px-4 text-base text-stone-900 ring-1 ring-inset ring-stone-200 placeholder:text-stone-400"
      />

      <p className="mb-1 text-xs font-medium text-stone-500">支払った人</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(Object.keys(PEOPLE) as PersonId[]).map((id) => {
          const person = PEOPLE[id];
          const selected = payer === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPayer(id)}
              className="h-14 rounded-2xl text-lg font-semibold transition active:scale-[0.98]"
              style={{
                backgroundColor: selected ? person.color : "#f5f5f4",
                color: selected ? "#fff" : "#44403c",
              }}
            >
              {person.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={amount <= 0}
        className="h-14 w-full rounded-2xl bg-teal-700 text-lg font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-stone-300 active:bg-teal-800"
      >
        登録する
      </button>
    </section>
  );
}
