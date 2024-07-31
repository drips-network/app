export class TooManyRecipientsError extends Error {
  constructor() {
    super('Only the first 200 were imported.', { cause: 'There were more than 200 entries in the CSV.' })
  }
}

export class InvalidRecipientError extends Error {
  line: number;
  value: string;
  type: string;

  static createMessage(type: string){
    switch(type) {
      case 'addresses':
        return 'This isn\'t a valid wallet address'
      case 'project':
        return 'This isn\'t a GitHub repo or isn\'t public'
      case 'drip-list':
        return 'This isn\'t a recognized Drip List'
      default:
        return 'This isn\'t valid'
    }
  }

  constructor(value: string, type: string, line: number) {
    super(InvalidRecipientError.createMessage(type))
    this.line = line
    this.value = value
    this.type = type
  }
}

export class UnrecognizedRecipientError extends Error {
  line: number;
  value: string;
  type: string;

  constructor(value: string, type: string, line: number) {
    super()
    this.line = line
    this.value = value
    this.type = type
  }
}