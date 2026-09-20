export type PersonId = "kanoko" | "atsushi";

export type CategoryId =
  | "rent"
  | "water"
  | "utilities"
  | "internet"
  | "food"
  | "living"
  | "leisure"
  | "keika_food"
  | "keika_snack"
  | "keika_hotel";

export type SplitMode = "income" | "food";

export interface Category {
  id: CategoryId;
  name: string;
  budget: number;
  split: SplitMode;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  payer: PersonId;
  /** 何に使ったかの手入力メモ（任意） */
  note: string;
  createdAt: string;
  month: string; // YYYY-MM
}

export interface AppState {
  expenses: Expense[];
}
