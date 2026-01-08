import ErrorModal from '$lib/components/error-modal/error-modal.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import modal from '$lib/stores/modal';

export default async function doWithErrorModal<RT>(
  fn: () => RT | Promise<RT>,
  onError?: (e: unknown) => void,
  onSuccessConfig?: {
    message: string;
    confetti: boolean;
  },
): Promise<Awaited<RT>> {
  try {
    const res = await fn();

    if (onSuccessConfig) {
      modal.show(SuccessStep, undefined, {
        message: onSuccessConfig.message,
        action: 'hide-modal',
        padding: true,
        confetti: onSuccessConfig.confetti,
      });
    }

    return res;
  } catch (e) {
    modal.show(ErrorModal, undefined, {
      message: e instanceof Error ? e.message : String(e),
    });

    onError?.(e);

    throw e;
  }
}
