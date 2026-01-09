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
): Promise<Awaited<BatchEntryResult[]>> {
  const results = await Promise.allSettled(fns.map((fn) => fn()));

  const finalResults = results.map((res) => {
    if (res.status === 'fulfilled') {
      return res.value;
    } else {
      return {
        success: false,
        errorMessage: res.reason instanceof Error ? res.reason.message : String(res.reason),
        error: res.reason,
      };
    }
  });

  const hasError = finalResults.some((r) => !r.success);

  if (hasError) {
    modal.show(BatchErrorModal, undefined, {
      errors: finalResults
        .filter((r): r is UnsuccessfulBatchEntryResult => !r.success)
        .map((r) => ({
          errorMessage: r.errorMessage,
        })),
    });
  }

  return finalResults;
}
