import { parseFile as parseCsv } from '$lib/utils/csv';

function hasHeader(parsedFile: Array<Array<string>>, csvHeaders: Array<string>): boolean {
  const row = parsedFile[0];
  // TODO: every?
  return row.some((column) => csvHeaders.includes(column.toLowerCase()));
}

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
