import { parseFile as parseCsv } from '$lib/utils/csv';

/**
 * Determine if at least on of the specified header names are in the header
 * of the given parsed CSV file.
 *
 * @param parsedFile A parsed CSV file.
 * @param csvHeaders A list of header names.
 * @returns True if at least on the specified header names exists in the
 *  header, false otherwise.
 */
function hasHeader(parsedFile: string[][], csvHeaders: string[]): boolean {
  const row = parsedFile[0];
  return row.some((column) => csvHeaders.includes(column.toLowerCase()));
}

/**
 * Get the indicies of the columns in the provided parsed CSV file, which correspond to
 * the given header names.
 *
 * @param parsedFile A parsed CSV file.
 * @param csvHeaders A list of header names.
 * @returns An array containing the indicies of the columns followed finally
 *  by the row index in which to start reading values.
 */
function getFileLayout(parsedFile: string[][], csvHeaders: string[]): number[] {
  const firstRow = parsedFile[0];

  // if there's no detected header, just return all the column
  // indicies
  if (!hasHeader(parsedFile, csvHeaders)) {
    return [...Array.from(firstRow.keys()), 0];
  }

  const dataIndices = [];
  for (const csvHeader of csvHeaders) {
    const csvHeaderIndex = firstRow.findIndex((column) => csvHeader === column.toLowerCase());
    dataIndices.push(csvHeaderIndex);
  }

  return [...dataIndices, 1];
}

/**
 * Parse a given CSV file, extracting the values specified by the
 * given header names.
 *
 * @param file The CSV HTML File to be parsed
 * @param csvHeaders The headers to be extracted
 * @returns A promise that resolves into the extracted data.
 */
export async function parseFile(file: File, csvHeaders: string[]): Promise<string[][]> {
  const parsedFile = await parseCsv(file);

  const fileLayout = getFileLayout(parsedFile, csvHeaders);
  const startRowIndex = fileLayout.pop();
  const dataIndices = fileLayout;
  const result = [];
  for (const row of parsedFile.slice(startRowIndex)) {
    const columns = dataIndices.map((index) => {
      const value = row[index];
      if (typeof value !== 'string') {
        return value;
      }

      return value.trim();
    });
    result.push(columns);
  }

  // underlying parsing lib loves to add a blank
  // row. remove it if present.
  const lastRow = result.at(-1);
  if (lastRow?.every((column) => !column)) {
    result.pop();
  }

  return result;
}

/**
 * Deduplicates entries by summing weights for duplicate recipients.
 *
 * @param entries The parsed CSV entries.
 * @returns Deduplicated entries with summed weights.
 */
export function deduplicateEntriesAndSumWeights(entries: string[][]): string[][] {
  const entriesMap = new Map<string, number | undefined>();

  for (const row of entries) {
    const recipient = row[0];
    // If recipient is missing, just skip or keep?
    // The original logic in upload.svelte skips empty recipients: if (!recipient.trim()) continue;
    // We can preserve that behavior by just keeping them in the map (keys might be empty string).
    // But Map keys must be unique.
    // If we have multiple empty lines, they merge?
    // upload.svelte filters them out anyway.

    const rawSplit = row[1];
    const weight = typeof rawSplit === 'undefined' ? undefined : parseFloat(rawSplit);

    if (entriesMap.has(recipient)) {
      const currentWeight = entriesMap.get(recipient);

      let newWeight: number | undefined = undefined;

      // If either has a weight, we treat undefined as 0 and sum
      if (currentWeight !== undefined || weight !== undefined) {
        const w1 = currentWeight ?? 0;
        const w2 = weight ?? 0;
        // Check for NaN. If any is NaN, the sum is NaN.
        // If we have "abc" (NaN) and "10", sum is NaN.
        // If we have "10" and "20", sum is 30.
        newWeight = w1 + w2;
      }

      entriesMap.set(recipient, newWeight);
    } else {
      entriesMap.set(recipient, weight);
    }
  }

  return Array.from(entriesMap.entries()).map(([recipient, weight]) => {
    if (weight === undefined) {
      return [recipient];
    }
    return [recipient, weight.toString()];
  });
}
