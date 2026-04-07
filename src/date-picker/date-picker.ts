import {
  dateIsAfter,
  dateIsBefore,
  normalizeMaxTime,
  normalizeMinTime
} from '@rolster/dates';

export interface DateRangeOptions {
  date: Date;
  maxDate?: Date;
  minDate?: Date;
}

export function dateIsOutRangeMin(options: DateRangeOptions): boolean {
  return (
    !!options.minDate &&
    dateIsBefore(normalizeMinTime(options.minDate), options.date)
  );
}

export function dateIsOutRangeMax(options: DateRangeOptions): boolean {
  return (
    !!options.maxDate &&
    dateIsAfter(normalizeMaxTime(options.maxDate), options.date)
  );
}

export function dateOutRange(options: DateRangeOptions): boolean {
  return dateIsOutRangeMin(options) || dateIsOutRangeMax(options);
}

export function verifyDateRange(options: DateRangeOptions): Date {
  return options.minDate && dateIsOutRangeMin(options)
    ? options.minDate
    : options.maxDate && dateIsOutRangeMax(options)
      ? options.maxDate
      : options.date;
}
