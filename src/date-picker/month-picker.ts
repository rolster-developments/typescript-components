import { valueIsDefined } from '@rolster/commons';
import { Month,MONTH_NAMES } from '@rolster/dates';
import { MonthLimitTemplate, MonthState } from './models';

export interface MonthPickerOptions {
  date: Date;
  month: number;
  year: number;
  maxDate?: Date;
  minDate?: Date;
}

export interface MonthLimitProps {
  date?: Date;
  maxDate?: Date;
  minDate?: Date;
  month?: Nulleable<number>;
}

function createMonthState(
  options: MonthPickerOptions,
  value: number
): MonthState {
  return {
    disabled: monthIsOutside(options, value),
    focused: value === options.month,
    label: MONTH_NAMES()[value],
    selected:
      options.date.getFullYear() === options.year &&
      value === options.date.getMonth(),
    value
  };
}

export function monthIsOutsideMin(
  options: MonthPickerOptions,
  month: number
): boolean {
  const { year, minDate } = options;

  return !minDate
    ? false
    : minDate.getFullYear() > year ||
        (minDate.getFullYear() === year && month < minDate.getMonth());
}

export function monthIsOutsideMax(
  options: MonthPickerOptions,
  month: number
): boolean {
  const { year, maxDate } = options;

  return !maxDate
    ? false
    : maxDate.getFullYear() < year ||
        (maxDate.getFullYear() === year && month > maxDate.getMonth());
}

export function monthIsOutside(
  options: MonthPickerOptions,
  month: number
): boolean {
  return monthIsOutsideMin(options, month) || monthIsOutsideMax(options, month);
}

export function verifyMonthPicker(
  options: MonthPickerOptions
): Undefined<number> {
  const { month, maxDate, minDate } = options;

  return minDate && monthIsOutsideMin(options, month)
    ? minDate.getMonth()
    : maxDate && monthIsOutsideMax(options, month)
      ? maxDate.getMonth()
      : undefined;
}

export function createMonthPicker(options: MonthPickerOptions): MonthState[] {
  return [
    createMonthState(options, Month.January),
    createMonthState(options, Month.February),
    createMonthState(options, Month.March),
    createMonthState(options, Month.April),
    createMonthState(options, Month.May),
    createMonthState(options, Month.June),
    createMonthState(options, Month.July),
    createMonthState(options, Month.August),
    createMonthState(options, Month.September),
    createMonthState(options, Month.October),
    createMonthState(options, Month.November),
    createMonthState(options, Month.December)
  ];
}

type MinMonthLimitProps = Omit<MonthLimitProps, 'maxDate'>;
type MaxMonthLimitProps = Omit<MonthLimitProps, 'minDate'>;

export function monthIsLimitMin(options: MinMonthLimitProps): boolean {
  if (valueIsDefined(options.month) && options.date) {
    const minYear = options.minDate ? options.minDate.getFullYear() : 0;
    const minMonth = options.minDate ? options.minDate.getMonth() : 0;

    return options.date.getFullYear() === minYear && options.month <= minMonth;
  }

  return false;
}

export function monthIsLimitMax(options: MaxMonthLimitProps): boolean {
  if (valueIsDefined(options.month) && options.date) {
    const maxYear = options.maxDate ? options.maxDate.getFullYear() : 10000;
    const maxMonth = options.maxDate ? options.maxDate.getMonth() : 11;

    return options.date.getFullYear() === maxYear && options.month >= maxMonth;
  }

  return false;
}

export function monthIsLimit(options: MaxMonthLimitProps): boolean {
  return monthIsLimitMin(options) || monthIsLimitMax(options);
}

export function monthLimitTemplate(
  options: MonthLimitProps
): MonthLimitTemplate {
  return {
    limitNext: monthIsLimitMax(options),
    limitPrevious: monthIsLimitMin(options)
  };
}
