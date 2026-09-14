# Rolster Components

Components utilities package compatible with Rolster projects.

## Installation

```
npm i @rolster/components
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Features

This package holds the framework-agnostic state and calculation logic behind the
Rolster UI components: date pickers, list fields, autocomplete and pagination.
It knows nothing about rendering — every function receives plain options and
returns plain state objects, which `@rolster/react-components` and
`@rolster/angular-components` turn into markup. Applications normally get it
transitively through one of those packages and only import from it directly to
build their own components or to reuse a calculation.

### Date pickers

Range guards for a whole `Date`, used before opening a picker or when applying
an external value.

| Signature                             | Description                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `dateIsOutRangeMin(options): boolean` | `date` falls before the start of the `minDate` day                |
| `dateIsOutRangeMax(options): boolean` | `date` falls after the end of the `maxDate` day                   |
| `dateOutRange(options): boolean`      | `date` is out of range on either side                             |
| `verifyDateRange(options): Date`      | `date` clamped to `minDate`/`maxDate`, or `date` when it is valid |
| `DateRangeOptions`                    | `{ date: Date; maxDate?: Date; minDate?: Date }`                  |

A missing bound never makes the date invalid: `minDate` is normalized to
`00:00:00` and `maxDate` to `23:59:59`, so both bounds are inclusive days.

```typescript
import { dateOutRange, verifyDateRange } from '@rolster/components';

const options = {
  date: new Date('2026-07-15T10:00:00'),
  minDate: new Date('2026-06-01'),
  maxDate: new Date('2026-06-30')
};

dateOutRange(options); // true
verifyDateRange(options); // 2026-06-30 (clamped to maxDate)
```

### Day picker

Builds the month grid of a calendar and validates a day of that month.
`DayPickerOptions` describes the visible month (`month`, `year`), the focused
`day` and the currently selected `date`.

| Signature                                     | Description                                                          |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `dayIsOutsideMin(options, day): boolean`      | the day of the visible month is earlier than `minDate`               |
| `dayIsOutsideMax(options, day): boolean`      | the day of the visible month is later than `maxDate`                 |
| `dayIsOutside(options, day): boolean`         | the day is outside either bound                                      |
| `verifyDayPicker(options): Undefined<number>` | day number of the exceeded bound, or `undefined` when `day` is valid |
| `createDayPicker(options): WeekState[]`       | weeks of the visible month, each one with seven `DayState` cells     |
| `DayPickerOptions`                            | `{ date, day, month, year, maxDate?, minDate? }`                     |
| `DayState`                                    | `{ disabled, focused, forbidden, selected, today, value? }`          |
| `WeekState`                                   | `{ days: DayState[] }`                                               |

Every week always has seven cells: the leading and trailing cells that do not
belong to the month are emitted as `forbidden: true` with no `value`.

```typescript
import { createDayPicker } from '@rolster/components';

const weeks = createDayPicker({
  date: new Date('2026-06-15'),
  day: 15,
  month: 5,
  year: 2026,
  minDate: new Date('2026-06-10')
});

weeks.length; // number of rows of the grid
weeks[0].days[0].forbidden; // true: June 2026 starts on Monday
weeks[2].days[1].selected; // true for 2026-06-15
weeks[1].days[0].disabled; // true for 2026-06-07, before minDate
```

### Day range picker

Same grid as the day picker, but each cell describes its position inside a
`DateRange` instead of a single selection. `sourceDate` is the bound the user
started the selection from.

| Signature                                         | Description                                            |
| ------------------------------------------------- | ------------------------------------------------------ |
| `dayRangeIsOutsideMin(options, day): boolean`     | the day of the visible month is earlier than `minDate` |
| `dayRangeIsOutsideMax(options, day): boolean`     | the day of the visible month is later than `maxDate`   |
| `dayRangeIsOutside(options, day): boolean`        | the day is outside either bound                        |
| `createDayRangePicker(options): WeekRangeState[]` | weeks of the visible month with the state of the range |
| `DayRangePickerOptions`                           | `{ date, range, sourceDate, maxDate?, minDate? }`      |
| `DayRangeState`                                   | `{ disabled, end, forbidden, ranged, source, value? }` |
| `WeekRangeState`                                  | `{ days: DayRangeState[] }`                            |

`end` marks the days that match `range.minDate` or `range.maxDate`, `ranged`
the days strictly between both bounds, and `source` the day of `sourceDate`.

```typescript
import { DateRange } from '@rolster/dates';
import { createDayRangePicker } from '@rolster/components';

const range = new DateRange(new Date('2026-06-10'), new Date('2026-06-20'));

const weeks = createDayRangePicker({
  date: new Date('2026-06-15'),
  range,
  sourceDate: new Date('2026-06-10')
});

weeks[2].days[3].ranged; // true for 2026-06-17, inside the range
weeks[1].days[3].end; // true for 2026-06-10, a bound of the range
weeks[1].days[3].source; // true: the selection started on that day
```

### Month picker

| Signature                                         | Description                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `monthIsOutsideMin(options, month): boolean`      | the month of `year` is earlier than the `minDate` month                 |
| `monthIsOutsideMax(options, month): boolean`      | the month of `year` is later than the `maxDate` month                   |
| `monthIsOutside(options, month): boolean`         | the month is outside either bound                                       |
| `verifyMonthPicker(options): Undefined<number>`   | month index of the exceeded bound, or `undefined` when `month` is valid |
| `createMonthPicker(options): MonthState[]`        | the twelve months of `year`, already labelled and flagged               |
| `monthIsLimitMin(options): boolean`               | `month` is the first selectable month of the `date` year                |
| `monthIsLimitMax(options): boolean`               | `month` is the last selectable month of the `date` year                 |
| `monthIsLimit(options): boolean`                  | `month` is the first or the last selectable month                       |
| `monthLimitTemplate(options): MonthLimitTemplate` | both limits at once, ready for the navigation arrows                    |
| `MonthPickerOptions`                              | `{ date, month, year, maxDate?, minDate? }`                             |
| `MonthState`                                      | `{ disabled, focused, label, selected, value }`                         |
| `MonthLimitProps`                                 | `{ date?, maxDate?, minDate?, month? }`                                 |
| `MonthLimitTemplate`                              | `{ limitNext, limitPrevious }`                                          |

The `label` of a `MonthState` comes from `MONTH_NAMES()` of `@rolster/dates`,
so it follows the `@rolster/i18n` locale. Without bounds, `monthIsLimitMin`
and `monthIsLimitMax` fall back to January of the year `0` and December of the
year `10000`; `monthIsLimit` is typed as `Omit<MonthLimitProps, 'minDate'>`,
use `monthLimitTemplate` when both bounds matter.

```typescript
import { createMonthPicker, monthLimitTemplate } from '@rolster/components';

const months = createMonthPicker({
  date: new Date('2026-06-15'),
  month: 5,
  year: 2026,
  minDate: new Date('2026-03-01')
});

months[0].disabled; // true (January is before minDate)
months[5].label; // 'Junio'
months[5].selected; // true

monthLimitTemplate({
  date: new Date('2026-03-15'),
  month: 2,
  minDate: new Date('2026-03-01')
}); // { limitNext: false, limitPrevious: true }
```

### Year picker

| Signature                                       | Description                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `yearIsOutlineMin(options): boolean`            | `year` is earlier than the `minDate` year                          |
| `yearIsOutlineMax(options): boolean`            | `year` is later than the `maxDate` year                            |
| `yearIsOutside(options): boolean`               | `year` is outside either bound                                     |
| `verifyYearPicker(options): Undefined<number>`  | year of the exceeded bound, or `undefined` when `year` is valid    |
| `createYearPicker(options): YearPickerTemplate` | window of nine years centered on `year`, plus its navigation flags |
| `YearPickerOptions`                             | `{ date, year, maxDate?, minDate? }`                               |
| `YearState`                                     | `{ disabled, focused, selected, value? }`                          |
| `YearPickerTemplate`                            | `{ canNext, canPrevious, maxRange, minRange, years }`              |

The window always has nine entries (four before, the center and four after).
Entries outside the bounds are emitted with no `value` and `disabled: true`;
`minRange`/`maxRange` report the first and last year actually available, and
`canPrevious`/`canNext` whether there is another window beyond them.

```typescript
import { createYearPicker } from '@rolster/components';

const template = createYearPicker({
  date: new Date('2026-06-15'),
  year: 2026,
  minDate: new Date('2024-01-01')
});

template.years.length; // 9
template.minRange; // 2024
template.canPrevious; // false (there is nothing before minDate)
template.years[4].focused; // true (2026 is the center)
```

### List fields

The state behind the select, list and autocomplete fields. An element wraps a
domain value and exposes what the list needs to render and to compare it.

| Signature                                             | Description                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `RolsterListElement<T>`                               | default `ListElement`: `uuid`, `description` and `title` are `String(value)`           |
| `RolsterAutocompleteElement<T>`                       | the same element plus `coincidence(pattern)` over the serialized value                 |
| `ListCollection<T, K>`                                | collection of elements with `find(value)`, indexed by an optional `reference`          |
| `createAutocompleteStore(options)`                    | filters the suggestions for a pattern and returns the reusable store                   |
| `locationListCanBottom(content, list, minHeight?)`    | the list still fits between the field and the bottom of the viewport                   |
| `locationListCanTop(content, list, minHeight?)`       | negation of `locationListCanBottom`: the list must be rendered above                   |
| `navigationListFromInput(options): Undefined<number>` | moves the focus from the input to the first or last element                            |
| `navigationListFromElement(options): number`          | moves the focus between elements, returning to the input at the edge                   |
| `AbstractListElement<T>`                              | `{ compareTo, description, filtrable, value }`                                         |
| `ListElement<T>`                                      | `AbstractListElement` plus `title`, `code?`, `icon?`, `img?`, `initials?`, `subtitle?` |
| `AutocompleteElement<T>`                              | `ListElement` shape plus `coincidence(pattern)`                                        |
| `AutocompleteStore<T, E>`                             | `{ pattern, previous, coincidences? }`                                                 |

`ListCollection` builds an internal `Map` when a `reference` function is given,
so `find` is constant time; without it, it falls back to `compareTo`. The
navigation helpers query the `.rls-field-list__element` nodes of the rendered
list, focus the matching one and return its position.

`createAutocompleteStore` filters incrementally: when the new pattern contains
the previous one, it only filters the coincidences already computed, walking
back through `previous` until it finds a usable step. Pass `reboot: true` to
drop the whole chain.

```typescript
import {
  RolsterAutocompleteElement,
  createAutocompleteStore
} from '@rolster/components';

const suggestions = ['Bogotá', 'Medellín', 'Cali'].map(
  (city) => new RolsterAutocompleteElement(city)
);

const { collection, store } = createAutocompleteStore({
  pattern: 'me',
  suggestions
});

collection.length; // 1 (Medellín)

// the next keystroke reuses the coincidences of the previous store
createAutocompleteStore({ pattern: 'med', suggestions, store });
```

### Pagination

`PaginationController` splits a collection into pages and keeps the state of
the visible page. Every command returns the new `Pagination<T>`, or `undefined`
when the movement is not possible.

| Signature                                      | Description                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `new PaginationController<T>(options)`         | `{ suggestions, count?, position? }`, `count` defaults to `20`    |
| `page: Page<T>`                                | getter with the collection of the visible page and its index      |
| `template: PaginationTemplate`                 | getter with the state the pager renders                           |
| `goFirstPage(): Pagination<T> \| undefined`    | moves to the first page, `undefined` when the collection is empty |
| `goPreviousPage(): Pagination<T> \| undefined` | moves one page back, `undefined` on the first page                |
| `goNextPage(): Pagination<T> \| undefined`     | moves one page forward, `undefined` on the last page              |
| `goLastPage(): Pagination<T> \| undefined`     | moves to the last page, `undefined` when the collection is empty  |
| `goToPage(state: PageState): Pagination<T>`    | moves to the page of the given state                              |
| `filtrable(criteria?): Pagination<T>`          | recalculates the pages over the filtered collection               |
| `Page<T>`                                      | `{ collection, index }`                                           |
| `PageState`                                    | `{ active, label, value, next?, previous? }`                      |
| `PaginationTemplate`                           | `{ currentPage, description, firstPage, lastPage, pages }`        |
| `Pagination<T>`                                | `{ page, template }`                                              |

`pages` holds at most four `PageState` entries around the visible one, each
linked to its `previous` and `next` sibling, and `description` is the
`'1 - 20 de 57'` legend. `filtrable()` without a criteria restores the original
collection.

```typescript
import { PaginationController, PatternCriteria } from '@rolster/components';

const controller = new PaginationController({
  suggestions: users,
  count: 10
});

controller.page.collection; // the first 10 users
controller.template.description; // '1 - 10 de 57'
controller.template.firstPage; // true

controller.goNextPage()?.page.index; // 1
controller.filtrable(new PatternCriteria('daniel')); // pages recalculated
```

### Criteria

A criteria decides whether a value survives a filter. It is the contract used
by `PaginationController.filtrable` and by `AbstractListElement.filtrable`.

| Signature                      | Description                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `FilterCriteria<T>`            | `{ apply(value: T): boolean }`                                                |
| `new PatternCriteria(pattern)` | matches the serialized value against the pattern, case and accent insensitive |

```typescript
import { FilterCriteria, PatternCriteria } from '@rolster/components';

new PatternCriteria('bogota').apply({ city: 'Bogotá' }); // true

class ActiveCriteria implements FilterCriteria<User> {
  public apply(user: User): boolean {
    return user.active;
  }
}
```

### Picker events

`PickerListener` is the payload every picker emits when the user resolves it.

| Member                       | Value            |
| ---------------------------- | ---------------- |
| `PickerListenerEvent.Select` | `'PickerSelect'` |
| `PickerListenerEvent.Now`    | `'PickerNow'`    |
| `PickerListenerEvent.Cancel` | `'PickerCancel'` |

```typescript
import { PickerListener, PickerListenerEvent } from '@rolster/components';

function onListener({ event, value }: PickerListener<Date>): void {
  switch (event) {
    case PickerListenerEvent.Select:
      return setDate(value);
    case PickerListenerEvent.Now:
      return setDate(new Date());
    case PickerListenerEvent.Cancel:
      return close();
  }
}
```

The value of a listener is a `Date`, a `DateRange`, a `Time` (both from
`@rolster/dates`) or a `number`, depending on the picker that emits it.

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
