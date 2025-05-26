import ErrorModal from '$lib/components/error-modal/error-modal.svelte';
import modal from '$lib/stores/modal';

export default async function doWithErrorModal<RT>(
  fn: () => RT | Promise<RT>,
): Promise<Awaited<RT>> {
  try {
    return await fn();
  } catch (e) {
    modal.show(ErrorModal, undefined, {
      message: e instanceof Error ? e.message : String(e),
    });

    throw e;
  }
}
