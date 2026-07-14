import {
  assignDayInDate,
  dateIsBetween,
  DateRange,
  getDateWeight,
  getDaysOfMonth
} from '@rolster/dates';

import { DAYS_WEEK } from './constants';
import { DayRangeState, WeekRangeState } from './models';

export interface DayRangePickerOptions {
  date: Date;
  range: DateRange;
  sourceDate: Date;
  maxDate?: Date;
  minDate?: Date;
}

function dateIsSelected(base: Date, date: Date, day: number): boolean {
  return (
    date.getFullYear() === base.getFullYear() &&
    date.getMonth() === base.getMonth() &&
    day === date.getDate()
  );
}

function sourceIsSelected(
  { sourceDate }: DayRangePickerOptions,
  base: Date,
  day: number
): boolean {
  return dateIsSelected(base, sourceDate, day);
}

function rangeIsSelected(
  { range }: DayRangePickerOptions,
  base: Date,
  day: number
): boolean {
  return (
    dateIsSelected(base, range.minDate, day) ||
    dateIsSelected(base, range.maxDate, day)
  );
}

function dayIsRange(
  { range }: DayRangePickerOptions,
  base: Date,
  day: number
): boolean {
  return dateIsBetween(
    range.minDate,
    range.maxDate,
    assignDayInDate(base, day)
  );
}

function createDayRangeState(
  options: DayRangePickerOptions,
  base: Date,
  day?: number
): DayRangeState {
  return {
    disabled: dayRangeIsOutside(options, day || 0),
    end: day ? rangeIsSelected(options, base, day) : false,
    forbidden: !day,
    ranged: day ? dayIsRange(options, base, day) : false,
    source: day ? sourceIsSelected(options, base, day) : false,
    value: day
  };
}

function createFirstWeek(
  options: DayRangePickerOptions,
  base: Date
): WeekRangeState {
  const days: DayRangeState[] = [];

  let day = 1;

  for (let start = 0; start < base.getDay(); start++) {
    days.push(createDayRangeState(options, base));
  }

  for (let end = base.getDay(); end < 7; end++) {
    days.push(createDayRangeState(options, base, day));

    day++;
  }

  return { days };
}

function createDaysPending(
  options: DayRangePickerOptions,
  base: Date,
  days: number
): DayRangeState[] {
  const daysPending: DayRangeState[] = [];
  const length = 7 - days;

  for (let index = 0; index < length; index++) {
    daysPending.push(createDayRangeState(options, base));
  }

  return daysPending;
}

function createNextWeeks(
  options: DayRangePickerOptions,
  base: Date
): WeekRangeState[] {
  const weeks: WeekRangeState[] = [];

  const dayCount = getDaysOfMonth(
    options.date.getFullYear(),
    options.date.getMonth()
  );

  let days: DayRangeState[] = [];
  let countDays = 1;
  let day = DAYS_WEEK - base.getDay() + 1;

  do {
    days.push(createDayRangeState(options, options.date, day));

    day++;
    countDays++;

    if (countDays > 7) {
      weeks.push({ days });

      days = [];
      countDays = 1;
    }
  } while (day <= dayCount);

  if (days.length && days.length < DAYS_WEEK) {
    weeks.push({
      days: [...days, ...createDaysPending(options, base, days.length)]
    });
  }

  return weeks;
}

export function dayRangeIsOutsideMin(
  options: DayRangePickerOptions,
  day: number
): boolean {
  return options.minDate
    ? getDateWeight(assignDayInDate(options.date, day)) <
        getDateWeight(options.minDate)
    : false;
}

export function dayRangeIsOutsideMax(
  options: DayRangePickerOptions,
  day: number
): boolean {
  return options.maxDate
    ? getDateWeight(assignDayInDate(options.date, day)) >
        getDateWeight(options.maxDate)
    : false;
}

export function dayRangeIsOutside(
  options: DayRangePickerOptions,
  day: number
): boolean {
  return (
    dayRangeIsOutsideMin(options, day) || dayRangeIsOutsideMax(options, day)
  );
}

export function createDayRangePicker(options: DayRangePickerOptions) {
  const date = new Date(options.date.getFullYear(), options.date.getMonth(), 1);

  const firstWeek = createFirstWeek(options, date);
  const nextWeeks = createNextWeeks(options, date);

  return [firstWeek, ...nextWeeks];
}
