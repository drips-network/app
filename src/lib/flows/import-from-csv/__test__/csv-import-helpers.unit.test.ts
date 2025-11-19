import { get, writable } from 'svelte/store';
import { createAddItemFunction, createClearItemsFunction } from '../csv-import-helpers';
import type { AccountId, ListEditorItem } from '$lib/components/list-editor/types';
import { toBigInt } from 'ethers';
import { parseFile } from '../parse-upload';
import splitsUnderflow from './data/splits-underflow.csv?raw';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
}));

describe('csv-import-helpers', () => {
  describe('createAddItemFunction', () => {
    it('fixes the underflow error by using Math.round with real CSV data', async () => {
      // Parse the actual splits-underflow.csv file
      const splitsUnderflowFile = new File(
        [new Blob([splitsUnderflow], { type: 'text/csv' })],
        'splits-underflow.csv',
      );
      const parsedFile = await parseFile(splitsUnderflowFile, [
        'ethereum_address',
        'impact_percentage',
      ]);

      // Get the problematic row (the one with 0.25380710659898476%)
      const problematicRow = parsedFile.find(
        ([address]) => address === '0x36a0880ce5d9faa1de64572e51b25e1954004380',
      );

      expect(problematicRow).toBeDefined();
      const [address, percentageStr] = problematicRow!;
      const percentage = parseFloat(percentageStr);

      // Create a mock context
      const context = writable({
        dripList: {
          items: {} as Record<string, ListEditorItem>,
          weights: {} as Record<string, number>,
        },
      });

      // Use the helper function to create addItem
      const addItem = createAddItemFunction(context, 'dripList');

      // Add the item with the problematic percentage from CSV
      const accountId = address as AccountId;
      const item: ListEditorItem = {
        type: 'address',
        address,
      };

      addItem(accountId, item, percentage);

      // Get the stored weight
      const storedWeight = get(context).dripList.weights[accountId as string];

      // The weight should be a clean integer, not a float
      expect(storedWeight).toBe(2538);
      expect(Number.isInteger(storedWeight)).toBe(true);

      // ethers.js should be able to encode it without throwing an underflow error
      expect(() => {
        const bigIntValue = toBigInt(storedWeight!);
        expect(bigIntValue).toBe(2538n);
      }).not.toThrow();
    });
  });

  describe('createClearItemsFunction', () => {
    it('clears all items and weights', () => {
      const context = writable({
        dripList: {
          items: {
            '1': { type: 'address', address: '0x1' },
            '2': { type: 'address', address: '0x2' },
          } as Record<string, ListEditorItem>,
          weights: {
            '1': 5000,
            '2': 5000,
          },
        },
      });

      const clearItems = createClearItemsFunction(context, 'dripList');
      clearItems();

      context.subscribe((c) => {
        expect(Object.keys(c.dripList.items).length).toBe(0);
        expect(Object.keys(c.dripList.weights).length).toBe(0);
      })();
    });
  });

  describe('addItem with duplicate accountIds', () => {
    it('overwrites items when the same accountId is added multiple times', () => {
      const context = writable({
        dripList: {
          items: {} as Record<string, ListEditorItem>,
          weights: {} as Record<string, number>,
        },
      });

      const addItem = createAddItemFunction(context, 'dripList');

      // Add an item
      const accountId = '0x1234' as AccountId;
      const item1: ListEditorItem = {
        type: 'address',
        address: '0x1234',
      };
      addItem(accountId, item1, 50);

      // Add the same accountId with different weight
      const item2: ListEditorItem = {
        type: 'address',
        address: '0x1234',
      };
      addItem(accountId, item2, 30);

      // The second call overwrites the first (object key behavior)
      const state = get(context);
      expect(Object.keys(state.dripList.items).length).toBe(1);
      expect(state.dripList.weights[accountId]).toBe(300000); // Math.round(30 * 10000)
    });
  });
});
