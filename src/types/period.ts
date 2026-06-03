export type Period = {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  note: string;
  createdAt: string; // ISO datetime
  updatedAt?: string; // ISO datetime
};

export type PeriodInput = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  note?: string;
};

export type PeriodUpdate = Partial<PeriodInput>;
