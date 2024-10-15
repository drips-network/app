import { parseFile as parseCsv } from '$lib/utils/csv';

export function hasHeader(parsedFile: Array<Array<string>>, csvHeaders: Array<string>): boolean {
  const row = parsedFile[0];
  // TODO: every?
  return row.some((column) => csvHeaders.includes(column.toLowerCase()));
}

export function getFileLayout(
  parsedFile: Array<Array<string>>,
  csvHeaders: Array<string>,
): Array<number> {
  const firstRow = parsedFile[0];

  if (!hasHeader(parsedFile, csvHeaders)) {
    return [0, 1, 0];
  }

  const dataIndices = [];
  for (const csvHeader of csvHeaders) {
    const csvHeaderIndex = firstRow.findIndex((column) => csvHeader === column.toLowerCase());
    // TODO: do we care?
    // if (csvHeaderIndex < 0) {
    //   return []
    // }

    dataIndices.push(csvHeaderIndex);
  }

  return [...dataIndices, 1];
}

export async function parseFile(
  file: File,
  csvHeaders: Array<string>,
): Promise<Array<Array<string>>> {
  const parsedFile = await parseCsv(file);

  const [recipientIndex, percentageIndex, startRowIndex] = getFileLayout(parsedFile, csvHeaders);
  const result = [];
  for (const row of parsedFile.slice(startRowIndex)) {
    result.push([row[recipientIndex], row[percentageIndex]]);
  }

  return result;
}
