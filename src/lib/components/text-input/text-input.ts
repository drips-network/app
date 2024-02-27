export type TextInputValidationState =
  | { type: 'unvalidated' }
  | { type: 'pending' }
  | { type: 'valid' }
  | { type: 'invalid'; message: string };
