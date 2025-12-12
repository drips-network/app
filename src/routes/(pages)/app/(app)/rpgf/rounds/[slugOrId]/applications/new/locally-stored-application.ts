import { browser } from '$app/environment';
import {
  createApplicationDtoSchema,
  type ApplicationCategory,
  type ApplicationForm,
} from '$lib/utils/rpgf/types/application';
import storedWritable from '@efstajas/svelte-stored-writable';
import { get } from 'svelte/store';
import z from 'zod';

const storageKey = (roundId: string, userId: string) => `rpgf-form-data-${roundId}-${userId}`;

export interface ApplicationData {
  projectName: string | null;

  // awkward but these are arrays so we can bind the `ListSelect` value directly to them.
  // 1st entry is the actual value.
  dripsAccountId: string[];
  categoryId: string[];

  answersByCategory: Record<string, z.infer<typeof createApplicationDtoSchema.shape.answers>>;
}

const args = (
  roundId: string,
  userId: string,
): [string, z.ZodType<ApplicationData>, ApplicationData, boolean] => [
  storageKey(roundId, userId),
  z.object({
    projectName: z.string().nullable(),
    dripsAccountId: z.array(z.string()).min(0).max(1),
    categoryId: z.array(z.string()).min(0).max(1),
    answersByCategory: z.record(z.string(), createApplicationDtoSchema.shape.answers),
  }),
  {
    projectName: null,
    dripsAccountId: [],
    categoryId: [],
    answersByCategory: {},
  },
  !browser,
];

export function locallyStoredApplicationExists(roundId: string, userId: string): boolean {
  if (!browser) return false;

  const record = get(getLocallyStoredApplication(roundId, userId, [], [], [], false));

  return (
    record.projectName !== null ||
    record.dripsAccountId.length > 0 ||
    record.categoryId.length > 0 ||
    Object.keys(record.answersByCategory).length > 0
  );
}

export function getLocallyStoredApplication(
  roundId: string,
  userId: string,
  categories: ApplicationCategory[],
  availableProjectAccountIds: string[],
  forms: ApplicationForm[],
  clean?: boolean,
): ReturnType<typeof storedWritable<ApplicationData>> {
  try {
    const writable = storedWritable<ApplicationData>(...args(roundId, userId));

    if (clean) {
      // Clean the stored data, because categories and / or their forms may have changed.
      writable.update((data) => {
        // remove data for categories that no longer exist
        for (const categoryId of Object.keys(data.answersByCategory)) {
          if (!categories.find((c) => c.id === categoryId)) {
            delete data.answersByCategory[categoryId];
          }
        }

        // remove data for fields that no longer exist within each category
        for (const [categoryId, answers] of Object.entries(data.answersByCategory)) {
          const formForCategory = categories.find((c) => c.id === categoryId)?.applicationForm.id;
          const form = forms.find((f) => f.id === formForCategory);

          if (!form) {
            delete data.answersByCategory[categoryId];
            continue;
          }

          for (const [index, value] of answers.entries()) {
            const fieldId = value.fieldId;

            if (!form.fields.find((f) => f.id === fieldId)) {
              data.answersByCategory[categoryId].splice(index, 1);
            }
          }
        }

        // ensure dripsAccountId is still valid
        if (
          data.dripsAccountId.length > 0 &&
          !availableProjectAccountIds.includes(data.dripsAccountId[0])
        ) {
          data.dripsAccountId = [];
        }

        return data;
      });
    }

    return writable;
  } catch (e) {
    //eslint-disable-next-line no-console
    console.error('Error parsing locally stored application data', e);

    // re-create the writable, this will reset the localstorage data
    if (browser) {
      localStorage.removeItem(storageKey(roundId, userId));
    }
    return storedWritable(...args(roundId, userId));
  }
}

export function clearLocallyStoredApplication(roundId: string, userId: string): void {
  if (browser) {
    localStorage.removeItem(storageKey(roundId, userId));
  }
}
