import { default as parseCSV } from 'csv-simple-parser';

export const parse = (csvString: string | undefined): unknown[][] | Record<string, unknown>[] => {
  if (!csvString) {
    return [];
  }

  return parseCSV(csvString)
};

export const parseFile = (file: File | undefined): Promise<Array<Array<string>>> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve([]);
    }

    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const parsedContent = parse(fileReader.result as string) as Array<Array<string>>;
      resolve(parsedContent);
    });
    fileReader.addEventListener('error', reject);

    fileReader.readAsText(file);
  });
};
