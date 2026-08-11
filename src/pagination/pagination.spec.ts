import { describe, expect, it } from 'vitest';
import { FilterCriteria } from '../commons';
import { PaginationController } from './pagination';

const COUNT = 20;

function createSuggestions(length: number): number[] {
  return Array.from({ length }, (_, index) => index + 1);
}

function createCriteria(values: number[]): FilterCriteria<number> {
  return { apply: (value) => values.includes(value) };
}

function createController(length = 95, position?: number) {
  return new PaginationController({
    suggestions: createSuggestions(length),
    count: COUNT,
    position
  });
}

describe('PaginationController', () => {
  describe('initial position', () => {
    it('should start on the first page when position is omitted', () => {
      const controller = createController();

      expect(controller.template.currentPage.value).toBe(0);
      expect(controller.page.collection[0]).toBe(1);
    });

    it('should start on the requested position', () => {
      const controller = createController(95, 2);

      expect(controller.template.currentPage.value).toBe(2);
      expect(controller.page.collection[0]).toBe(41);
    });

    it('should start on the last valid position', () => {
      const controller = createController(95, 4);

      expect(controller.template.currentPage.value).toBe(4);
      expect(controller.page.collection).toHaveLength(15);
      expect(controller.template.lastPage).toBe(true);
    });

    it('should discard a position equal to the page count', () => {
      const controller = createController(95, 5);

      expect(controller.template.currentPage.value).toBe(0);
      expect(controller.page.collection[0]).toBe(1);
    });

    it('should discard a position beyond the page count', () => {
      const controller = createController(95, 9);

      expect(controller.template.currentPage.value).toBe(0);
      expect(controller.page.collection[0]).toBe(1);
    });

    it('should discard a negative position', () => {
      const controller = createController(95, -1);

      expect(controller.template.currentPage.value).toBe(0);
      expect(controller.page.collection[0]).toBe(1);
    });

    it('should discard any position when the collection is empty', () => {
      const controller = createController(0, 3);

      expect(controller.template.currentPage.value).toBe(0);
      expect(controller.page.collection).toHaveLength(0);
    });
  });

  describe('filtrable', () => {
    it('should return to the first page when the collection shrinks', () => {
      const controller = createController();

      controller.goToPage({ active: false, label: '3', value: 2 });

      const { page, template } = controller.filtrable(createCriteria([3, 7]));

      expect(template.currentPage.value).toBe(0);
      expect(page.collection).toEqual([3, 7]);
    });

    it('should keep the position when it remains valid', () => {
      const controller = createController();

      controller.goToPage({ active: false, label: '2', value: 1 });

      const criteria = createCriteria(createSuggestions(60));
      const { page, template } = controller.filtrable(criteria);

      expect(template.currentPage.value).toBe(1);
      expect(page.collection[0]).toBe(21);
    });

    it('should describe the filtered collection', () => {
      const controller = createController();

      const { template } = controller.filtrable(createCriteria([3, 7]));

      expect(template.description).toBe('1 - 2 de 2');
    });

    it('should restore the whole collection when the criteria is removed', () => {
      const controller = createController();

      controller.filtrable(createCriteria([3, 7]));

      const { page, template } = controller.filtrable(undefined);

      expect(template.currentPage.value).toBe(0);
      expect(page.collection).toHaveLength(COUNT);
      expect(template.description).toBe('1 - 20 de 95');
    });
  });

  describe('navigation', () => {
    it('should not advance beyond the last page', () => {
      const controller = createController(95, 4);

      expect(controller.goNextPage()).toBeUndefined();
      expect(controller.template.currentPage.value).toBe(4);
    });

    it('should not go back beyond the first page', () => {
      const controller = createController();

      expect(controller.goPreviousPage()).toBeUndefined();
      expect(controller.template.currentPage.value).toBe(0);
    });

    it('should go to the last page', () => {
      const controller = createController();

      const { page } = controller.goLastPage()!;

      expect(page.index).toBe(4);
      expect(page.collection).toHaveLength(15);
    });

    it('should go to the first page', () => {
      const controller = createController(95, 3);

      const { page } = controller.goFirstPage()!;

      expect(page.index).toBe(0);
      expect(page.collection[0]).toBe(1);
    });
  });
});
