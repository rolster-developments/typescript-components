import { coincidence } from '@rolster/strings';
import {
  AbstractAutocompleteElement as Element,
  AutocompleteStore,
  AutocompleteStoreNulleable
} from './models';

interface FilterOptions<T = any, E extends Element<T> = Element<T>> {
  pattern: Nulleable<string>;
  suggestions: E[];
  reboot?: boolean;
  store?: AutocompleteStore<T, E>;
}

interface FilterResponse<T, E extends Element<T> = Element<T>> {
  collection: E[];
  store: AutocompleteStore<T, E>;
}

function createEmptyStore<
  T = any,
  E extends Element<T> = Element<T>
>(): AutocompleteStore<T, E> {
  return {
    coincidences: undefined,
    pattern: '',
    previous: null
  };
}

function searchForPattern<T = any, E extends Element<T> = Element<T>>(
  options: FilterOptions<T, E>
): AutocompleteStoreNulleable<T, E> {
  if (!options.store?.pattern) {
    return null;
  }

  let currentStore: AutocompleteStoreNulleable<T, E> = options.store;
  let search = false;

  while (!search && currentStore) {
    search = coincidence(options.pattern || '', currentStore.pattern, true);

    if (!search) {
      currentStore = currentStore.previous;
    }
  }

  return currentStore || createEmptyStore();
}

export function createAutocompleteStore<
  T = any,
  E extends Element<T> = Element<T>
>(options: FilterOptions<T, E>): FilterResponse<T, E> {
  const { pattern, suggestions, reboot } = options;

  if (!pattern) {
    return {
      collection: suggestions,
      store: createEmptyStore()
    };
  }

  const store = reboot ? createEmptyStore<T, E>() : searchForPattern(options);
  const elements = store?.coincidences || suggestions;

  const coincidences = elements.filter((element) =>
    element.coincidence(pattern)
  );

  return {
    collection: coincidences,
    store: {
      coincidences,
      pattern,
      previous: store
    }
  };
}
