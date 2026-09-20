import type { CategoryId, Expense, PersonId } from "./types";

/** Supabase expenses テーブルの行 */
export interface ExpenseRow {
  id: string;
  amount: number;
  category_id: string;
  payer: string;
  note: string;
  created_at: string;
  month: string;
}

export function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    categoryId: row.category_id as CategoryId,
    payer: row.payer as PersonId,
    note: row.note ?? "",
    createdAt: row.created_at,
    month: row.month,
  };
}

export function expenseToInsert(input: {
  amount: number;
  categoryId: CategoryId;
  payer: PersonId;
  note: string;
  month: string;
  createdAt: string;
}): Omit<ExpenseRow, "id"> {
  return {
    amount: input.amount,
    category_id: input.categoryId,
    payer: input.payer,
    note: input.note,
    month: input.month,
    created_at: input.createdAt,
  };
}
