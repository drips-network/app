import modal from '$lib/stores/modal';
import BatchErrorModal from '$lib/components/error-modal/batch-error-modal.svelte';

type UnsuccessfulBatchEntryResult = {
  success: false;
  errorMessage: string;
  error: unknown;
};

type BatchEntryResult =
  | {
      success: true;
    }
  | UnsuccessfulBatchEntryResult;

export default async function doBatchWithErrorModal(
  fns: (() => BatchEntryResult | Promise<BatchEntryResult>)[],
  { concurrency = 5 }: { concurrency?: number } = {},
): Promise<Awaited<BatchEntryResult[]>> {
  const safeConcurrency = Math.max(1, Math.floor(concurrency));

  const results: BatchEntryResult[] = new Array(fns.length);
  let currentIndex = 0;

  const worker = async () => {
    while (true) {
      const index = currentIndex++;
      if (index >= fns.length) return;

      try {
        results[index] = await fns[index]();
      } catch (err) {
        results[index] = {
          success: false,
          errorMessage: err instanceof Error ? err.message : String(err),
          error: err,
        };
      }
    }
  };

  await Promise.allSettled(Array.from({ length: Math.min(safeConcurrency, fns.length) }, worker));

  const hasError = results.some((r) => !r.success);

  if (hasError) {
    modal.show(BatchErrorModal, undefined, {
      errors: results
        .filter((r): r is UnsuccessfulBatchEntryResult => !r.success)
        .map((r) => ({
          errorMessage: r.errorMessage,
        })),
    });
  }

  return results;
}
