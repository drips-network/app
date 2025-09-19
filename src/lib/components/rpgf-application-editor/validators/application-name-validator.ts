import type { TextInputValidationState } from '$lib/components/text-input/text-input';

export default function applicationNameValidator(name: string | null): TextInputValidationState {
  if (!name) {
    return { type: 'unvalidated' };
  } else if (name && name.length > 0 && name.length <= 255) {
    return { type: 'valid' };
  } else {
    return {
      type: 'invalid',
      message: 'Project name must be between 1 and 255 characters long.',
    };
  }
}
