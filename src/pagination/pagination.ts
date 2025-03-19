import { FilterCriteria } from '../commons';
import { Page, PageState, Pagination, PaginationTemplate } from './models';

const DEFAULT_COUNT_COLLECTION = 20;
const FIRST_PAGE = 0;
const MAX_VISIBLE_PAGES = 4;
const MIN_NUMBER_PAGE = 1;

interface ControllerOptions<T = any> {
  collection: T[];
  count: number;
  index: number;
}

interface PaginationControllerOptions<T = any> {
  suggestions: T[];
  count?: number;
  position?: number;
}

export class PaginationController<T = any> {
  private suggestions: T[];

  private collection: T[];

  private position = 0;

  private count: number;

  private currentTemplate: PaginationTemplate;

  private currentPage: Page<T>;

  constructor(options: PaginationControllerOptions<T>) {
    this.suggestions = options.suggestions;
    this.collection = options.suggestions;

    const index = options.position ?? 0;

    this.count = options.count || DEFAULT_COUNT_COLLECTION;
    this.position = index <= this.maxPage ? index : 0;

    const { page, template } = this.createPagination({
      collection: this.suggestions,
      count: this.count,
      index: this.position
    });

    this.currentPage = page;
    this.currentTemplate = template;
  }

  private get maxPage(): number {
    return this.collection.length
      ? Math.ceil(this.collection.length / this.count)
      : 0;
  }

  public get page(): Page<T> {
    return this.currentPage;
  }

  public get template(): PaginationTemplate {
    return this.currentTemplate;
  }

  public goFirstPage(): Pagination<T> | undefined {
    return this.collection.length
      ? this.refreshForIndex(FIRST_PAGE)
      : undefined;
  }

  public goPreviousPage(): Pagination<T> | undefined {
    const { previous, value } = this.template.currentPage;

    if (previous) {
      return this.refreshForIndex(previous.value);
    } else {
      const prevIndex = value - MIN_NUMBER_PAGE;

      return prevIndex >= FIRST_PAGE
        ? this.refreshForIndex(prevIndex)
        : undefined;
    }
  }

  public goNextPage(): Pagination<T> | undefined {
    const { next, value } = this.template.currentPage;

    if (next) {
      return this.refreshForIndex(next.value);
    } else {
      const nextIndex = value + 1;

      return nextIndex <= this.maxPage
        ? this.refreshForIndex(nextIndex)
        : undefined;
    }
  }

  public goLastPage(): Pagination<T> | undefined {
    return this.collection.length
      ? this.refreshForIndex(this.maxPage - MIN_NUMBER_PAGE)
      : undefined;
  }

  public goToPage({ value }: PageState): Pagination<T> {
    return this.refreshForIndex(value);
  }

  public filtrable(criteria?: FilterCriteria<T>): Pagination<T> {
    this.collection = criteria
      ? this.suggestions.filter((suggestion) => criteria.apply(suggestion))
      : this.suggestions;

    const pagination = this.createPagination({
      collection: this.collection,
      count: this.count,
      index: this.position
    });

    this.currentPage = pagination.page;
    this.currentTemplate = pagination.template;

    return pagination;
  }

  private createPage(options: ControllerOptions<T>): Page<T> {
    const { collection, count, index } = options;

    return {
      collection: !collection.length
        ? []
        : collection.slice(index * count, (index + MIN_NUMBER_PAGE) * count),
      index
    };
  }

  private createPageState(value: number): PageState {
    return {
      active: value === this.position,
      label: (value + 1).toString(),
      value
    };
  }

  private createDescription(page: Page<T>): string {
    const start = page.index * this.count + MIN_NUMBER_PAGE;
    let finish = (page.index + MIN_NUMBER_PAGE) * this.count;

    if (finish > this.suggestions.length) {
      finish = this.suggestions.length;
    }

    return `${start} - ${finish} de ${this.suggestions.length}`;
  }

  private createTemplate(page: Page<T>): PaginationTemplate {
    const { index } = page;

    let maxPageVisible = index + MAX_VISIBLE_PAGES;

    if (maxPageVisible > this.maxPage) {
      maxPageVisible = this.maxPage;
    }

    let minIndexPage = maxPageVisible - MAX_VISIBLE_PAGES;

    if (minIndexPage < 0) {
      minIndexPage = 0;
    } else if (minIndexPage > index) {
      minIndexPage = index;
    }

    let pagePrevious = undefined;
    let currentPage = this.createPageState(0);
    const pages = [];

    for (let i = minIndexPage; i < maxPageVisible; i++) {
      const page = this.createPageState(i);

      if (page.value === index) {
        currentPage = page;
      }

      pages.push(page);

      page.previous = pagePrevious;

      if (pagePrevious) {
        pagePrevious.next = page;
      }

      pagePrevious = page;
    }

    return {
      currentPage,
      description: this.createDescription(page),
      firstPage: index === FIRST_PAGE,
      lastPage: index === this.maxPage - 1,
      pages
    };
  }

  private createPagination(options: ControllerOptions<T>): Pagination<T> {
    const page = this.createPage(options);

    return {
      page,
      template: this.createTemplate(page)
    };
  }

  private refreshForIndex(index: number): Pagination<T> {
    this.position = index;

    const pagination = this.createPagination({
      collection: this.collection,
      count: this.count,
      index
    });

    this.currentPage = pagination.page;
    this.currentTemplate = pagination.template;

    return pagination;
  }
}
