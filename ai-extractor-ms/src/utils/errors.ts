export class ExtractionError extends Error {
  constructor(message: string, public id?: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
