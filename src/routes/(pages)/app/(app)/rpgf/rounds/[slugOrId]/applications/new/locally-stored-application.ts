import { browser } from '$app/environment';
import { createApplicationDtoSchema } from '$lib/utils/rpgf/types/application';
import storedWritable from '@efstajas/svelte-stored-writable';
import z from 'zod';

const storageKey = (roundId: string) => `rpgf-form-data-${roundId}`;

const args: (roundId: string) => Parameters<typeof storedWritable> = (roundId) => [
  storageKey(roundId),
  z.object({
    projectName: z.string().optional(),
    dripsAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    answersByCategory: z.record(createApplicationDtoSchema.shape.answers),
  }),
  {
    projectName: undefined,
    dripsAccountId: undefined,
    categoryId: undefined,
    answersByCategory: {},
  },
  !browser,
];

export function getLocallyStoredApplication(roundId: string) {
  try {
    const writable = storedWritable(...args(roundId));
    return writable;
  } catch (e) {
    //eslint-disable-next-line no-console
    console.error('Error parsing locally stored application data', e);

    // re-create the writable, this will reset the localstorage data
    if (browser) {
      localStorage.removeItem(storageKey(roundId));
    }
    return storedWritable(...args(roundId));
  }
}
