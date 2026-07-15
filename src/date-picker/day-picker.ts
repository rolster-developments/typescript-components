import {
  dateIsEqualsWeight,
  getDateWeight,
  getDaysOfMonth
} from '@rolster/dates';
import { DAYS_WEEK } from './constants';
import { DayState, WeekState } from './models';

export interface DayPickerOptions {
  date: Date;
  day: number;
  month: number;
  year: number;
  maxDate?: Date;
  minDate?: Date;
}

function createDayState(
  options: DayPickerOptions,
  today: Date,
  value?: number
): DayState {
  const dateValue = value && new Date(options.year, options.month, value);

  return {
    disabled: dayIsOutside(options, value || 0),
    focused: !!value && options.day === value,
    forbidden: !value,
    selected: !!dateValue && dateIsEqualsWeight(options.date, dateValue),
    today: !!dateValue && dateIsEqualsWeight(today, dateValue),
    value
  };
}

function createFirstWeek(
  options: DayPickerOptions,
  date: Date,
  today: Date
): WeekState {
  const days: DayState[] = [];

  let day = 1;

  for (let start = 0; start < date.getDay(); start++) {
    days.push(createDayState(options, today));
  }

  for (let end = date.getDay(); end < 7; end++) {
    days.push(createDayState(options, today, day));

    day++;
  }

  return { days };
}

function createDaysPending(
  options: DayPickerOptions,
  today: Date,
  days: number
): DayState[] {
  const daysPending: DayState[] = [];
  const length = 7 - days;

  for (let index = 0; index < length; index++) {
    daysPending.push(createDayState(options, today));
  }

  return daysPending;
}

function createNextWeeks(
  options: DayPickerOptions,
  date: Date,
  today: Date
): WeekState[] {
  const daysMonth = getDaysOfMonth(date.getFullYear(), date.getMonth());
  const weeks: WeekState[] = [];

  let days: DayState[] = [];
  let countDays = 1;
  let day = DAYS_WEEK - date.getDay() + 1;

  do {
    days.push(createDayState(options, today, day));

    day++;
    countDays++;

    if (countDays > DAYS_WEEK) {
      weeks.push({ days });

      days = [];
      countDays = 1;
    }
  } while (day <= daysMonth);

  if (days.length && days.length < DAYS_WEEK) {
    weeks.push({
      days: [...days, ...createDaysPending(options, today, days.length)]
    });
  }

  return weeks;
}

export function dayIsOutsideMin(
  options: DayPickerOptions,
  day: number
): boolean {
  return options.minDate
    ? getDateWeight(new Date(options.year, options.month, day)) <
        getDateWeight(options.minDate)
    : false;
}

export function dayIsOutsideMax(
  options: DayPickerOptions,
  day: number
): boolean {
  return options.maxDate
    ? getDateWeight(new Date(options.year, options.month, day)) >
        getDateWeight(options.maxDate)
    : false;
}

export function dayIsOutside(options: DayPickerOptions, day: number): boolean {
  return dayIsOutsideMin(options, day) || dayIsOutsideMax(options, day);
}

export function verifyDayPicker(options: DayPickerOptions): Undefined<number> {
  return options.minDate && dayIsOutsideMin(options, options.day)
    ? options.minDate.getDate()
    : options.maxDate && dayIsOutsideMax(options, options.day)
      ? options.maxDate.getDate()
      : undefined;
}

export function createDayPicker(options: DayPickerOptions) {
  const date = new Date(options.year, options.month, 1);
  const today = new Date();

  const firstWeek = createFirstWeek(options, date, today);
  const nextWeeks = createNextWeeks(options, date, today);

  return [firstWeek, ...nextWeeks];
}
