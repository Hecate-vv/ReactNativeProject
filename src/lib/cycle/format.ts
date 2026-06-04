import { parseIsoDate } from '@/lib/cycle/period-range';

export const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fromIsoDate = (s: string) => parseIsoDate(s);

const dateFormatter = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' });

export function formatDisplayDate(isoOrDate: string | Date): string {
  const date =
    typeof isoOrDate === 'string' ? fromIsoDate(isoOrDate) : isoOrDate;
  return dateFormatter.format(date);
}

export function formatDaysLabel(count: number): string {
  if (count === 0) return 'dziś';
  if (count === 1) return 'za 1 dzień';
  if (count > 1) return `za ${count} dni`;
  if (count === -1) return '1 dzień temu';
  return `${Math.abs(count)} dni temu`;
}
