import type { TextInputValidationState } from 'radicle-design-system/TextInput';

export default function (value: string | undefined) {
  const validationRegex = /^\d{4}-\d{2}-\d{2}$/;

  let validationState: TextInputValidationState;
  let date: Date | undefined;

  if (!value) {
    validationState = {
      type: 'unvalidated',
    };
  } else if (value.match(validationRegex)) {
    const parsed = new Date(value);
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    const isInFuture = now.getTime() < parsed.getTime();

    if (isInFuture) {
      validationState = {
        type: 'valid',
      };
      date = new Date(value);
    } else {
      validationState = {
        type: 'invalid',
        message: 'Enter a valid date in the future',
      };
    }
  } else {
    validationState = {
      type: 'invalid',
      message: 'Enter a valid date in format YYYY-MM-DD',
    };
  }

  return {
    date,
    validationState,
  };
}
