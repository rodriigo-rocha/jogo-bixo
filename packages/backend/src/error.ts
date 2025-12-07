// Definição de erros HTTP personalizados

export class BaseHttpError extends Error {
  public status: number;
  constructor(status: number, message: string) { 
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}
export class BadRequestError extends BaseHttpError {
  constructor(message: string = "Requisição inválida") {
    super(400, message);
  }
}

export class UnauthorizedError extends BaseHttpError {
  constructor(message: string = "Credenciais inválidas") {
    super(401, message);
  }
}

export class NotFoundError extends BaseHttpError {
  constructor(message: string = "Recurso não encontrado") {
    super(404, message);
  }
}

export class ConflictError extends BaseHttpError {
  constructor(message: string = "Já existe um recurso com estes dados") {
    super(409, message);
  }
}
