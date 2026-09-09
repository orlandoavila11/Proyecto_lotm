export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  readonly statusCode = 404;
  readonly errorCode = 'ENTITY_NOT_FOUND';
}

export class ConflictError extends DomainError {
  readonly statusCode = 409;
  readonly errorCode = 'CONFLICT';
}

export class DomainRuleViolationError extends DomainError {
  readonly statusCode = 422;
  readonly errorCode = 'DOMAIN_RULE_VIOLATION';
}

export class ValidationDomainError extends DomainError {
  readonly statusCode = 400;
  readonly errorCode = 'VALIDATION_ERROR';
}

