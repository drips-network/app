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
function hasHeader(parsedFile: Array<Array<string>>, csvHeaders: Array<string>): boolean {
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
function getFileLayout(parsedFile: Array<Array<string>>, csvHeaders: Array<string>): Array<number> {
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
export async function parseFile(
  file: File,
  csvHeaders: Array<string>,
): Promise<Array<Array<string>>> {
  const parsedFile = await parseCsv(file);

  const fileLayout = getFileLayout(parsedFile, csvHeaders);
  const startRowIndex = fileLayout.pop();
  const dataIndices = fileLayout;
  const result = [];
  for (const row of parsedFile.slice(startRowIndex)) {
    const columns = dataIndices.map((index) => row[index]);
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
