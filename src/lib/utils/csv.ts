import { inferSchema, initParser } from 'udsv';

export const parse = <T extends unknown[] = []>(csvString: string | undefined): T[] => {
  if (!csvString) {
    return [];
  }

  const schema = inferSchema(csvString, {
    // don't ignore first row as headers
    header: () => [],
  });
  const parser = initParser(schema);
  return parser.typedArrs(csvString);
};

export const parseFile = <T extends unknown[] = []>(file: File | undefined): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve([]);
    }

    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const parsedContent = parse(fileReader.result as string) as T[];
      resolve(parsedContent);
    });
    fileReader.addEventListener('error', reject);

    fileReader.readAsText(file);
  });
};
