import { parseFile } from '$lib/flows/import-from-csv/parse-upload';
import { WEIGHT_FACTOR } from '$lib/flows/import-from-csv/import-from-csv-steps';
import splitsUnderflow from './data/splits-underflow.csv?raw';
import { toBigInt } from 'ethers';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
}));

describe('splits underflow error', () => {
  let splitsUnderflowFile: File;

  beforeAll(() => {
    splitsUnderflowFile = new File(
      [new Blob([splitsUnderflow], { type: 'text/csv' })],
      'splits-underflow.csv',
    );
  });

  it('should demonstrate the ethers.js underflow error when Math.round is not used', async () => {
    const csvHeaders = ['ethereum_address', 'impact_percentage'];
    const parsedFile = await parseFile(splitsUnderflowFile, csvHeaders);

    // Get the problematic row (the one with 0.25380710659898476%)
    const problematicRow = parsedFile.find(
      ([address]) => address === '0x36a0880ce5d9faa1de64572e51b25e1954004380',
    );

    expect(problematicRow).toBeDefined();
    const [, percentageStr] = problematicRow!;
    const percentage = parseFloat(percentageStr);

    // Convert percentage to weight WITHOUT Math.round (the bug)
    const weightWithoutRound = percentage * WEIGHT_FACTOR;

    // This will have floating-point precision issues
    expect(weightWithoutRound).toBe(2538.0710659898477);

    // Attempting to encode this with ethers.js will fail
    expect(() => {
      toBigInt(weightWithoutRound);
    }).toThrow(/underflow/);
  });

  it('should show the fix using Math.round before ethers.js encoding', async () => {
    const csvHeaders = ['ethereum_address', 'impact_percentage'];
    const parsedFile = await parseFile(splitsUnderflowFile, csvHeaders);

    // Get the problematic row
    const problematicRow = parsedFile.find(
      ([address]) => address === '0x36a0880ce5d9faa1de64572e51b25e1954004380',
    );

    expect(problematicRow).toBeDefined();
    const [, percentageStr] = problematicRow!;
    const percentage = parseFloat(percentageStr);

    // Convert percentage to weight WITH Math.round (the fix)
    const weightWithRound = Math.round(percentage * WEIGHT_FACTOR);

    // This will be a clean integer
    expect(weightWithRound).toBe(2538);

    // ethers.js can encode this without error
    expect(() => {
      const bigIntValue = toBigInt(weightWithRound);
      expect(bigIntValue).toBe(2538n);
    }).not.toThrow();
  });

  it('should verify all rows from splits-underflow.csv can cause precision issues', async () => {
    const csvHeaders = ['ethereum_address', 'impact_percentage'];
    const parsedFile = await parseFile(splitsUnderflowFile, csvHeaders);

    const precisionIssues: Array<{
      address: string;
      percentage: number;
      withoutRound: number;
      withRound: number;
    }> = [];

    for (const [address, percentageStr] of parsedFile) {
      if (!address || address === 'ethereum_address') continue;

      const percentage = parseFloat(percentageStr);
      const withoutRound = percentage * WEIGHT_FACTOR;
      const withRound = Math.round(percentage * WEIGHT_FACTOR);

      // Check if there's a floating-point precision issue
      if (withoutRound !== withRound) {
        precisionIssues.push({
          address,
          percentage,
          withoutRound,
          withRound,
        });
      }
    }

    // At least the problematic row should have precision issues
    expect(precisionIssues.length).toBeGreaterThan(0);

    // Verify the specific problematic case
    const problematicCase = precisionIssues.find(
      (issue) => issue.address === '0x36a0880ce5d9faa1de64572e51b25e1954004380',
    );
    expect(problematicCase).toBeDefined();
    expect(problematicCase?.withoutRound).toBe(2538.0710659898477);
    expect(problematicCase?.withRound).toBe(2538);
  });
});
