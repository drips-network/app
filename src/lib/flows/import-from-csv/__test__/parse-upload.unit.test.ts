import { parseFile } from '$lib/flows/import-from-csv/parse-upload';
import splits from './data/splits.csv?raw';
import splitsHeader from './data/splits-header.csv?raw';
import splitsHeaderExtra from './data/splits-header-extra.csv?raw';
import splitsHeaderCase from './data/splits-header-case.csv?raw';
import splitsHeaderSpace from './data/splits-header-space.csv?raw';
import collaboratorsHeaderMixed from './data/collaborators-header-mixed.csv?raw';

vi.mock('$app/environment', () => ({
  browser: true,
}));

describe('parse upload', () => {
  describe('given a splits file', () => {
    const csvHeaders = ['recipient', 'percentage'];
    let splitsFile: File;
    let splitsHeaderFile: File;
    let splitsHeaderExtraFile: File;
    let splitsHeaderCaseFile: File;
    let splitsHeaderSpaceFile: File;

    beforeAll(() => {
      splitsFile = new File([new Blob([splits], { type: 'text/csv' })], 'name');
      splitsHeaderFile = new File([new Blob([splitsHeader], { type: 'text/csv' })], 'name');
      splitsHeaderExtraFile = new File(
        [new Blob([splitsHeaderExtra], { type: 'text/csv' })],
        'name',
      );
      splitsHeaderCaseFile = new File([new Blob([splitsHeaderCase], { type: 'text/csv' })], 'name');
      splitsHeaderSpaceFile = new File(
        [new Blob([splitsHeaderSpace], { type: 'text/csv' })],
        'name',
      );
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

    it('should parse a valid splits file with extra columns correctly', async () => {
      const parsedFile = await parseFile(splitsHeaderExtraFile, csvHeaders);
      expect(parsedFile[0][0]).toBe('0x79756b6C2f913271fc0ee29A877fbd98258972BF');
      expect(parsedFile[0][1]).toBe('20');
    });

    it('should parse a valid splits file with mixed case headers correctly', async () => {
      const parsedFile = await parseFile(splitsHeaderCaseFile, csvHeaders);
      expect(parsedFile[0][0]).toBe('0x79756b6C2f913271fc0ee29A877fbd98258972BF');
      expect(parsedFile[0][1]).toBe('20');
    });

    it('should parse a valid splits file and remove trim white space', async () => {
      const parsedFile = await parseFile(splitsHeaderSpaceFile, csvHeaders);
      expect(parsedFile[0][0]).toBe('https://github.com/user/project/');
    });
  });

  describe('given a collaborators file', () => {
    const csvHeaders = ['collaborator'];
    let collaboratorsHeaderMixedFile: File;

    beforeAll(() => {
      collaboratorsHeaderMixedFile = new File(
        [new Blob([collaboratorsHeaderMixed], { type: 'text/csv' })],
        'name',
      );
    });

    it('should parse a valid collaborators file correctly', async () => {
      const parsedFile = await parseFile(collaboratorsHeaderMixedFile, csvHeaders);
      expect(parsedFile[0][0]).toBe('0x79756b6C2f913271fc0ee29A877fbd98258972BF');
      expect(parsedFile[0][1]).toBe(undefined);
    });
  });
});
