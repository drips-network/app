export class AddItemError extends Error {
  constructor(
    message: string,
    public severity: 'warning' | 'error',
    public submessage?: string,
    public suberrors?: Array<AddItemSuberror>
  ) {
    super(message);
  }
}

export class AddItemSuberror extends Error {
  constructor(message: string, cause: string, public lineNumber: number) {
    super(message, { cause })
  }
}