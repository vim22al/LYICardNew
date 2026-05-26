export class ExtractionError extends Error {
    id;
    constructor(message, id) {
        super(message);
        this.id = id;
        this.name = 'ExtractionError';
    }
}
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
