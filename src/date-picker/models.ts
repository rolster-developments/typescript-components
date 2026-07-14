export interface DayState {
  disabled: boolean;
  focused: boolean;
  forbidden: boolean;
  selected: boolean;
  today: boolean;
  value?: number;
}

export interface WeekState {
  days: DayState[];
}

export interface DayRangeState {
  disabled: boolean;
  end: boolean;
  forbidden: boolean;
  ranged: boolean;
  source: boolean;
  value?: number;
}

export interface WeekRangeState {
  days: DayRangeState[];
}

export interface MonthState {
  disabled: boolean;
  focused: boolean;
  label: string;
  selected: boolean;
  value: number;
}

export interface MonthLimitTemplate {
  limitNext: boolean;
  limitPrevious: boolean;
}

export interface YearState {
  disabled: boolean;
  focused: boolean;
  selected: boolean;
  value?: number;
}

export interface YearPickerTemplate {
  canNext: boolean;
  canPrevious: boolean;
  maxRange: number;
  minRange: number;
  years: YearState[];
}
