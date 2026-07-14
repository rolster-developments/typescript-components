import { COUNT_YEAR_RANGE } from './constants';
import { YearPickerTemplate, YearState } from './models';

export interface YearPickerOptions {
  date: Date;
  year: number;
  maxDate?: Date;
  minDate?: Date;
}

function createYear(options: YearPickerOptions, value?: number): YearState {
  return {
    disabled: !value,
    focused: value === options.year,
    selected: value === options.date.getFullYear(),
    value
  };
}

export function yearIsOutlineMin(options: YearPickerOptions): boolean {
  return options.minDate ? options.year < options.minDate.getFullYear() : false;
}

export function yearIsOutlineMax(options: YearPickerOptions): boolean {
  return options.maxDate ? options.year > options.maxDate.getFullYear() : false;
}

export function yearIsOutside(props: YearPickerOptions): boolean {
  return yearIsOutlineMin(props) || yearIsOutlineMax(props);
}

export function verifyYearPicker(
  options: YearPickerOptions
): Undefined<number> {
  return options.minDate && yearIsOutlineMin(options)
    ? options.minDate.getFullYear()
    : options.maxDate && yearIsOutlineMax(options)
      ? options.maxDate.getFullYear()
      : undefined;
}

export function createYearPicker(
  options: YearPickerOptions
): YearPickerTemplate {
  const prevYears: YearState[] = [];
  const nextYears: YearState[] = [];

  let minRange = options.year;
  let maxRange = options.year;

  const minYear = options.minDate?.getFullYear() || 0;
  const maxYear = options.maxDate?.getFullYear() || 10000;

  for (let index = 0; index < COUNT_YEAR_RANGE; index++) {
    const prevValue = options.year - COUNT_YEAR_RANGE + index;
    const nextValue = options.year + index + 1;

    const prevYear = prevValue >= minYear ? prevValue : undefined;
    const nextYear = nextValue <= maxYear ? nextValue : undefined;

    const prevState = createYear(options, prevYear);
    const nextState = createYear(options, nextYear);

    prevYears.push(prevState);
    nextYears.push(nextState);

    if (!!prevState.value && minRange > prevState.value) {
      minRange = prevState.value;
    }

    if (!!nextState.value && maxRange < nextState.value) {
      maxRange = nextState.value;
    }
  }

  const yearCenter = createYear(options, options.year);

  return {
    canPrevious: minYear < minRange,
    canNext: maxYear > maxRange,
    maxRange,
    minRange,
    years: [...prevYears, yearCenter, ...nextYears]
  };
}
