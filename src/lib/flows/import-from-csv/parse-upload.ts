import { parseFile as parseCsv } from '$lib/utils/csv';

export function hasHeader(parsedFile: Array<Array<string>>, csvHeaders: Array<string>): boolean {
  const row = parsedFile[0];
  // console.log(row, csvHeaders)
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

  const dataIndicesLength = Math.max(csvHeaders.length, 2);
  const dataIndices = Array(dataIndicesLength).fill(-1);
  for (const [index, csvHeader] of csvHeaders.entries()) {
    const csvHeaderIndex = firstRow.findIndex((column) => csvHeader === column.toLowerCase());
    dataIndices[index] = csvHeaderIndex;
  }

  return [...dataIndices, 1];
}

export async function parseFile(
  file: File,
  csvHeaders: Array<string>,
): Promise<Array<Array<string>>> {
  const parsedFile = await parseCsv(file);

  const [recipientOrCollaboratorIndex, percentageIndex, startRowIndex] = getFileLayout(
    parsedFile,
    csvHeaders,
  );
  const result = [];
  for (const row of parsedFile.slice(startRowIndex)) {
    if (!row[recipientOrCollaboratorIndex] && !row[percentageIndex]) {
      continue;
    }

    result.push([row[recipientOrCollaboratorIndex], row[percentageIndex]]);
  }

  return result;
}
