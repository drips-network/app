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

export const parseFile = (file: File | undefined) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      // TODO: not very cool and type scripty here.
      const parsedContent = parse(fileReader.result as string);
      resolve(parsedContent);
    });
    fileReader.addEventListener('error', reject);

    fileReader.readAsText(file);
  });
};
