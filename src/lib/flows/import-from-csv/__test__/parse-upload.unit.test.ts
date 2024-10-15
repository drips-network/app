import { parseFile } from '$lib/flows/import-from-csv/parse-upload';
import splits from './data/splits.csv?raw';
import splitsHeader from './data/splits-header.csv?raw';

vi.mock('$app/environment', () => ({
  browser: true,
}));

describe('parse csv', () => {
  const csvHeaders = ['recipient', 'percentage'];
  let splitsFile: File;
  let splitsHeaderFile: File;

  beforeAll(() => {
    splitsFile = new File([new Blob([splits], { type: 'text/csv' })], 'name');

    splitsHeaderFile = new File([new Blob([splitsHeader], { type: 'text/csv' })], 'name');
  });

  it('should parse a valid splits file correctly', async () => {
    const parsedFile = await parseFile(splitsFile, csvHeaders);
    expect(parsedFile[0][0]).toBe('0x79756b6C2f913271fc0ee29A877fbd98258972BF');
    expect(parsedFile[0][1]).toBe('20');
  });

  it('should parse a valid splits file with a header correctly', async () => {
    const parsedFile = await parseFile(splitsHeaderFile, csvHeaders);
    expect(parsedFile[0][0]).toBe('0x79756b6C2f913271fc0ee29A877fbd98258972BF');
    expect(parsedFile[0][1]).toBe('20');
  });
});
