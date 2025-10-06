import type { AccountId, ListEditorItem } from '$lib/components/list-editor/types';
import { WEIGHT_FACTOR } from './import-from-csv-steps';
import type { Writable } from 'svelte/store';
import type { DripListConfig } from '$lib/components/drip-list-editor/drip-list-editor.svelte';

/**
 * Structure for items containing a list of items and their weights
 */
type ItemsContainer = Pick<DripListConfig, 'items' | 'weights'>;

/**
 * Creates an addItem function for CSV imports that properly handles weight conversion
 * with Math.round to prevent ethers.js underflow errors.
 *
 * @param context - The writable store containing the state
 * @param itemsPath - The path to the items object in the context (e.g., 'dripList', 'maintainerSplits')
 * @returns A function that adds an item with proper weight conversion
 */
export function createAddItemFunction<T extends Record<string, ItemsContainer>>(
  context: Writable<T>,
  itemsPath: keyof T,
) {
  return (key: AccountId, item: ListEditorItem, weight: number | undefined) => {
    context.update((c) => {
      // Update items
      const currentItems = c[itemsPath]?.items || {};
      c[itemsPath].items = {
        ...currentItems,
        [key]: item,
      };

      // Update weights with Math.round to prevent floating-point precision issues
      if (weight !== undefined) {
        // ✅ FIX: Use Math.round to convert floating-point percentages to clean integers
        // This prevents ethers.js underflow errors when encoding BigInt values
        // Example: 0.25380710659898476 * 10000 = 2538.0710659898477 (without Math.round)
        //          Math.round(0.25380710659898476 * 10000) = 2538 (with Math.round)
        c[itemsPath].weights[key] = Math.round(weight * WEIGHT_FACTOR);
      }

      return c;
    });
  };
}

/**
 * Creates a clearItems function for CSV imports.
 *
 * @param context - The writable store containing the state
 * @param itemsPath - The path to the items object in the context
 * @returns A function that clears all items and weights
 */
export function createClearItemsFunction<T extends Record<string, ItemsContainer>>(
  context: Writable<T>,
  itemsPath: keyof T,
) {
  return () => {
    context.update((c) => {
      c[itemsPath].items = {};
      c[itemsPath].weights = {};
      return c;
    });
  };
}
