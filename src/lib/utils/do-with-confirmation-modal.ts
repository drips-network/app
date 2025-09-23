import ConfirmModal from '$lib/components/confirm-modal/confirm-modal.svelte';
import modal from '$lib/stores/modal';

export default async function doWithConfirmationModal<RT>(
  message: string,
  fn: () => RT | Promise<RT>,
): Promise<Awaited<RT> | null> {
  const promise: Promise<Awaited<RT> | null> = new Promise((resolve) => {
    modal.show(
      ConfirmModal,
      () => {
        // user cancelled the action
        resolve(null);
      },
      {
        message,
        onConfirm: async () => {
          resolve(await fn());
        },
      },
    );
  });

  return await promise;
}
