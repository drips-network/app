import { inferSchema, initParser } from 'udsv';

export const parse = (csvString) => {
  const schema = inferSchema(csvString);
  const parser = initParser(schema);
  return parser.typedArrs(csvString);
};

export const parseFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const parsedContent = parse(fileReader.result);
      resolve(parsedContent);
    });
    fileReader.addEventListener('error', reject);

    fileReader.readAsText(file);
  });
};
