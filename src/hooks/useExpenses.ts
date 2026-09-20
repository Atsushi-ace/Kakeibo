"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { currentMonthKey } from "@/lib/calculations";
import {
  expenseToInsert,
  rowToExpense,
  type ExpenseRow,
} from "@/lib/expenseMapper";
import { getSupabase } from "@/lib/supabase";
import type { CategoryId, Expense, PersonId } from "@/lib/types";

function sortByNewest(list: Expense[]): Expense[] {
  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const month = currentMonthKey();

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const rows = (data ?? []) as ExpenseRow[];
    setExpenses(sortByNewest(rows.map(rowToExpense)));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await refresh();
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "データの読み込みに失敗しました",
          );
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void init();

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null =
      null;

    try {
      const supabase = getSupabase();
      channel = supabase
        .channel("expenses-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses" },
          () => {
            void refresh().catch(() => {
              /* リアルタイム更新失敗は無視（手動操作は生きる） */
            });
          },
        )
        .subscribe();
    } catch {
      /* 環境変数未設定時は init 側で error 表示 */
    }

    return () => {
      cancelled = true;
      if (channel) {
        void getSupabase().removeChannel(channel);
      }
    };
  }, [refresh]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.month === month),
    [expenses, month],
  );

  const addExpense = useCallback(
    async (input: {
      amount: number;
      categoryId: CategoryId;
      payer: PersonId;
      note?: string;
    }) => {
      setSaving(true);
      setError(null);
      try {
        const supabase = getSupabase();
        const payload = expenseToInsert({
          amount: input.amount,
          categoryId: input.categoryId,
          payer: input.payer,
          note: (input.note ?? "").trim(),
          month: currentMonthKey(),
        });

        const { data, error: insertError } = await supabase
          .from("expenses")
          .insert(payload)
          .select("*")
          .single();

        if (insertError) throw new Error(insertError.message);

        const created = rowToExpense(data as ExpenseRow);
        setExpenses((prev) => sortByNewest([created, ...prev]));
        return created;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "登録に失敗しました";
        setError(message);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const removeExpense = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    const previous = expenses;
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      const supabase = getSupabase();
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (deleteError) throw new Error(deleteError.message);
    } catch (e) {
      setExpenses(previous);
      const message =
        e instanceof Error ? e.message : "削除に失敗しました";
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [expenses]);

  return {
    expenses,
    monthExpenses,
    month,
    hydrated,
    error,
    saving,
    addExpense,
    removeExpense,
    refresh,
  };
}
