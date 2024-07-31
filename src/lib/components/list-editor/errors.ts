export class AddItemError extends Error {
  constructor(
    message: string,
    public severity: 'warning' | 'error',
  ) {
    super(message);
  }
}