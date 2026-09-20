"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { currentMonthKey } from "@/lib/calculations";
import { STORAGE_KEY } from "@/lib/constants";
import type { AppState, CategoryId, Expense, PersonId } from "@/lib/types";

const EMPTY: AppState = { expenses: [] };

function normalizeExpense(raw: Partial<Expense>): Expense | null {
  if (
    typeof raw.id !== "string" ||
    typeof raw.amount !== "number" ||
    typeof raw.categoryId !== "string" ||
    typeof raw.payer !== "string" ||
    typeof raw.createdAt !== "string" ||
    typeof raw.month !== "string"
  ) {
    return null;
  }
  return {
    id: raw.id,
    amount: raw.amount,
    categoryId: raw.categoryId as CategoryId,
    payer: raw.payer as PersonId,
    note: typeof raw.note === "string" ? raw.note : "",
    createdAt: raw.createdAt,
    month: raw.month,
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.expenses)) return EMPTY;
    return {
      expenses: parsed.expenses
        .map((e) => normalizeExpense(e))
        .filter((e): e is Expense => e !== null),
    };
  } catch {
    return EMPTY;
  }
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const month = currentMonthKey();

  useEffect(() => {
    setExpenses(loadState().expenses);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ expenses });
  }, [expenses, hydrated]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.month === month),
    [expenses, month],
  );

  const addExpense = useCallback(
    (input: {
      amount: number;
      categoryId: CategoryId;
      payer: PersonId;
      note?: string;
    }) => {
      const next: Expense = {
        id: createId(),
        amount: input.amount,
        categoryId: input.categoryId,
        payer: input.payer,
        note: (input.note ?? "").trim(),
        createdAt: new Date().toISOString(),
        month: currentMonthKey(),
      };
      setExpenses((prev) => [next, ...prev]);
      return next;
    },
    [],
  );

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearMonth = useCallback(() => {
    const m = currentMonthKey();
    setExpenses((prev) => prev.filter((e) => e.month !== m));
  }, []);

  return {
    expenses,
    monthExpenses,
    month,
    hydrated,
    addExpense,
    removeExpense,
    clearMonth,
  };
}
