import { coincidence } from '@rolster/strings';
import { FilterCriteria } from '../commons';

export interface AbstractListElement<T = any> {
  compareTo(value: T): boolean;
  description: string;
  filtrable(criteria: FilterCriteria<T>): boolean;
  value: T;
}

export interface AbstractAutocompleteElement<
  T = any
> extends AbstractListElement<T> {
  coincidence(pattern: string): boolean;
}

export interface ListElement<T = any> extends AbstractListElement<T> {
  title: string;
  code?: string;
  icon?: string;
  img?: string;
  initials?: string;
  subtitle?: string;
}

export interface AutocompleteElement<
  T = any
> extends AbstractAutocompleteElement<T> {
  title: string;
  code?: string;
  icon?: string;
  img?: string;
  initials?: string;
  subtitle?: string;
}

export interface AutocompleteStore<
  T,
  E extends AbstractAutocompleteElement<T> = AbstractAutocompleteElement<T>
> {
  pattern: string;
  previous: Nulleable<AutocompleteStore<T, E>>;
  coincidences?: E[];
}

export type AutocompleteStoreNulleable<
  T,
  E extends AbstractAutocompleteElement<T> = AbstractAutocompleteElement<T>
> = AutocompleteStore<T, E> | null;

export class RolsterListElement<T = any> implements ListElement<T> {
  protected _uuid: string;

  protected _description: string;

  protected _title: string;

  constructor(public readonly value: T) {
    this._uuid = String(value);
    this._description = String(value);
    this._title = String(value);
  }

  public get uuid(): string {
    return this._uuid;
  }

  public get description(): string {
    return this._description;
  }

  public get title(): string {
    return this._title;
  }

  public compareTo(value: T): boolean {
    return value === this.value;
  }

  public filtrable(criteria: FilterCriteria<T>): boolean {
    return criteria.apply(this.value);
  }
}

export class RolsterAutocompleteElement<T = any>
  extends RolsterListElement<T>
  implements AutocompleteElement<T>
{
  public coincidence(pattern: string): boolean {
    return coincidence(JSON.stringify(this.value), pattern, true);
  }
}

export class ListCollection<T = any, K = string> {
  protected map: Map<K, AbstractListElement<T>> = new Map();

  constructor(
    public readonly value: AbstractListElement<T>[],
    private reference?: (value: T) => K
  ) {
    if (reference) {
      value.forEach((element) => {
        this.map.set(reference(element.value), element);
      });
    }
  }

  public find(value: T): Undefined<AbstractListElement<T>> {
    if (!this.reference) {
      return this.value.find((current) => current.compareTo(value));
    }

    return this.map.get(this.reference(value));
  }
}
