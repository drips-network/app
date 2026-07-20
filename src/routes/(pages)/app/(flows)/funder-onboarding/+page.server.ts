import { blueprintSchema } from '../../../../../lib/utils/blueprints/schemas.js';
import type { Blueprint, BlueprintError } from '../../../../../lib/utils/blueprints/schemas.js';

export const load = async ({ fetch, url }) => {
  const blueprintIdParam = url.searchParams.get('blueprintId');

  let blueprint: Blueprint | undefined = undefined;
  let blueprintError: BlueprintError | undefined = undefined;

  if (blueprintIdParam) {
    const blueprintResponse = await fetch(`/api/list-blueprints/${blueprintIdParam}`);

    if (!blueprintResponse.ok) {
      blueprintError = blueprintResponse.status === 404 ? 'not-found' : 'unknown';
    } else {
      const asJson = await blueprintResponse.json().catch(() => null);
      const parsedBlueprint = blueprintSchema.safeParse(asJson);

      if (!parsedBlueprint.success) {
        blueprintError = 'invalid';
      } else {
        blueprint = parsedBlueprint.data;
      }
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
