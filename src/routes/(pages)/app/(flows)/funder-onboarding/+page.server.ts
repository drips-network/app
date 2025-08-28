import type z from 'zod';
import { blueprintSchema } from '../../../../api/list-blueprints/blueprintSchema.js';

export const load = async ({ fetch, url }) => {
  const blueprintIdParam = url.searchParams.get('blueprintId');

  let blueprint: z.infer<typeof blueprintSchema> | undefined = undefined;
  let blueprintError: 'not-found' | 'unknown' | 'invalid' | undefined = undefined;

  if (blueprintIdParam) {
    const blueprintResponse = await fetch(`/api/list-blueprints/${blueprintIdParam}`);

    if (!blueprintResponse.ok) {
      blueprintError = blueprintResponse.status === 404 ? 'not-found' : 'unknown';
    }

    const asJson = await blueprintResponse.json().catch(() => null);
    const parsedBlueprint = blueprintSchema.safeParse(asJson);

    if (!parsedBlueprint.success) {
      blueprintError = 'invalid';
    } else {
      blueprint = parsedBlueprint.data;
    }
  }

  return {
    blueprintOrBlueprintError: blueprintError
      ? { blueprintError: blueprintError }
      : blueprint
        ? { blueprint }
        : undefined,
  };
};
