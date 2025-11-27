import {
  parseFile,
  deduplicateEntriesAndSumWeights,
} from '$lib/flows/import-from-csv/parse-upload';
import splits from './data/splits.csv?raw';
import splitsHeader from './data/splits-header.csv?raw';
import splitsHeaderExtra from './data/splits-header-extra.csv?raw';
import splitsHeaderCase from './data/splits-header-case.csv?raw';
import splitsHeaderSpace from './data/splits-header-space.csv?raw';
import collaboratorsHeaderMixed from './data/collaborators-header-mixed.csv?raw';
import splitsDuplicateAddress from './data/splits-duplicate-address.csv?raw';

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

  describe('deduplicateEntriesAndSumWeights', () => {
    let splitsDuplicateAddressFile: File;

    beforeAll(() => {
      splitsDuplicateAddressFile = new File(
        [new Blob([splitsDuplicateAddress], { type: 'text/csv' })],
        'name',
      );
    });

    it('should sum weights for duplicate recipients', async () => {
      const parsedFile = await parseFile(splitsDuplicateAddressFile, [
        'ethereum_address',
        'impact_percentage',
      ]);

      // Should have 5 entries (duplicates included)
      expect(parsedFile).toHaveLength(5);

      const deduplicatedFile = deduplicateEntriesAndSumWeights(parsedFile);

      // Should have 4 unique entries (5 rows - 1 duplicate)
      expect(deduplicatedFile).toHaveLength(4);

      // Find the merged entry
      const mergedEntry = deduplicatedFile.find(
        (row) => row[0] === '0x9D8dC28E9d9C4C5a387A858182edF9ab8B90F565',
      );

      expect(mergedEntry).toBeDefined();
      // 10.66 + 0.72 = 11.38
      expect(mergedEntry![1]).toBe('11.38');
    });
    it('should handle mixed undefined and defined weights', () => {
      const entries = [
        ['recipient1', '10'],
        ['recipient1'], // undefined
      ];

      const result = deduplicateEntriesAndSumWeights(entries);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(['recipient1', '10']);
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
