import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

interface TResponse {
  errorMessage: string;
  stack?: string;
}

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZodExceptionFilter.name);

  constructor() {}

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    this.logger.error('Zod Validation Error', exception.issues);

    const responseBody: TResponse = {
      errorMessage: exception.issues[0]?.message || 'Validation failed',
      stack: exception.stack,
    };

    response.status(HttpStatus.BAD_REQUEST).json(responseBody);
  }
}
