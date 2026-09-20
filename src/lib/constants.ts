import type { Category, CategoryId, PersonId } from "./types";

export const PEOPLE: Record<
  PersonId,
  { id: PersonId; name: string; income: number; color: string }
> = {
  atsushi: {
    id: "atsushi",
    name: "敦史",
    income: 360_000,
    color: "#1d6a7a",
  },
  kanoko: {
    id: "kanoko",
    name: "かのこ",
    income: 250_000,
    color: "#c45c26",
  },
};

export const HOUSEHOLD_INCOME = 610_000;

/** 敦史 : かのこ ≈ 59% : 41% */
export const INCOME_SHARE: Record<PersonId, number> = {
  atsushi: PEOPLE.atsushi.income / HOUSEHOLD_INCOME,
  kanoko: PEOPLE.kanoko.income / HOUSEHOLD_INCOME,
};

/** 食費のみ固定 80:20 */
export const FOOD_SHARE: Record<PersonId, number> = {
  atsushi: 0.8,
  kanoko: 0.2,
};

export const CATEGORIES: Category[] = [
  { id: "rent", name: "家賃", budget: 100_000, split: "income" },
  { id: "water", name: "水道代", budget: 4_000, split: "income" },
  { id: "utilities", name: "光熱費（電気ガス）", budget: 4_500, split: "income" },
  { id: "internet", name: "インターネット", budget: 5_000, split: "income" },
  { id: "food", name: "食費", budget: 100_000, split: "food" },
  { id: "living", name: "生活費", budget: 3_000, split: "income" },
  { id: "leisure", name: "余暇", budget: 98_000, split: "income" },
  { id: "keika_food", name: "景花（食費）", budget: 19_000, split: "income" },
  { id: "keika_snack", name: "景花（おやつ）", budget: 10_000, split: "income" },
  { id: "keika_hotel", name: "景花（ペットホテル）", budget: 35_000, split: "income" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const MONTHLY_BUDGET_TOTAL = CATEGORIES.reduce(
  (sum, c) => sum + c.budget,
  0,
);

/** 手元に残る額の50% */
export const TARGET_SAVINGS = Math.round(
  (HOUSEHOLD_INCOME - MONTHLY_BUDGET_TOTAL) * 0.5,
);

export const STORAGE_KEY = "kakeibo-v1";

export const WARNING_THRESHOLD = 0.8;
