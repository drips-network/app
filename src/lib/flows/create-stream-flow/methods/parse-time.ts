import type { TextInputValidationState } from '$lib/components/text-input/text-input';

function parse(input: string): { h: number; m: number; s: number } {
  const date = new Date(`January 1, 1970 ${input} UTC`);

  return {
    h: date.getUTCHours(),
    m: date.getUTCMinutes(),
    s: date.getUTCSeconds(),
  };
}

export default function (value: string | undefined) {
  const validationRegex = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/;

  let validationState: TextInputValidationState;
  let time: { h: number; m: number; s: number } | undefined;

  if (!value) {
    validationState = {
      type: 'unvalidated',
    };
  } else if (value.match(validationRegex)) {
    validationState = {
      type: 'valid',
    };
    time = parse(value);
  } else {
    validationState = {
      type: 'invalid',
      message: 'Enter a valid time in format HH:MM:SS',
    };
  }

  return {
    time,
    validationState,
  };
}
