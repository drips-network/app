import type { ZodSchema, z } from 'zod';

export type Parser<Schemas extends ZodSchema[] = ZodSchema[]> = {
  parseLatest: (input: unknown) => z.infer<Schemas[0]>;
  parseAnyVersion: (input: unknown) => z.infer<Schemas[number]>;
  getLatestSchema: () => Schemas[0];
  getAllSchemas: () => Schemas;
};

/** Type of the newest schema version in this parser */
export type LatestVersion<PT extends Parser> = ReturnType<PT['parseLatest']>;

/** Type of any schema version in this parser */
export type AnyVersion<PT extends Parser> = ReturnType<PT['parseAnyVersion']>;

export type LatestVersionSchema<PT extends Parser> = ReturnType<PT['getLatestSchema']>;
export type AllVersionSchema<PT extends Parser> = ReturnType<PT['getAllSchemas']>;

/**
 * Create a versioned parser. Create it with any amount of versions of the same schema.
 * Call `parseLatest` to parse using the latest version of the schema, or `parseAnyVersion`
 * to parse using any version of the schema. `parseAnyVersion` will attempt to parse using
 * the latest version first, then the second-latest, and so on. The versions are ordered newest
 * to oldest.
 * @param ...args The versions of the schema to include in the parser. Must be ordered newest to oldest.
 */
export const createVersionedParser = <ZT extends ZodSchema[]>(
  ...args: [...ZT]
): Parser<typeof args> => {
  /**
   * Parse object `input` using the latest version of the schema.
   * @param input The data to parse using the latest schema.
   * @returns The data parsed using the latest schema.
   */
  function parseLatest(input: unknown): z.infer<(typeof args)[0]> {
    return args[0].parse(input);
  }

  /**
   * Parse object `input` using any version of the schema. Attempts parsing
   * using the latest version first, then the second-latest, and so on.
   * @param input The data to parse using any version of the schema.
   * @returns The data parsed using the latest schema.
   */
  function parseAnyVersion(input: unknown): z.infer<ZT[number]> {
    // Attempt parsing with all versions, starting with the latest.
    for (const version of args) {
      try {
        const parsed = version.parse(input);
        return parsed;
      } catch (e) {
        // If parsing fails, try the next version.
        continue;
      }
    }

    // If parsing fails for all versions, throw an error.
    throw new Error(`Failed to parse metadata (no version matched): ${input}`);
  }

  function getLatestSchema(): (typeof args)[0] {
    return args[0];
  }

  function getAllSchemas(): ZT {
    return args;
  }

  return {
    parseLatest,
    parseAnyVersion,
    getLatestSchema,
    getAllSchemas,
  };
};
