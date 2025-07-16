import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('AllExceptionsFilter');

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const errorResponse = this.formatErrorResponse(exception, status, request);

    logger.error(`Error occurred: ${exception.message}`, exception.stack);

    response.status(status).json(errorResponse);
  }

  private formatErrorResponse(exception: any, status: number, request: Request) {
    const errorResponse: any = {
      success: false,
      statusCode: status,
      message: exception.message || 'Internal Server Error',
      error: exception.name || 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object' && responseBody !== null) {
        errorResponse.message = responseBody['message'] || exception.message;
        errorResponse.error = responseBody['error'] || exception.name;
      }
    }

    // Handling ValidationError explicitly
    if (exception.name === 'BadRequestException' && exception.message.includes('Validation')) {
      errorResponse.message = 'Bad Request: The data you provided is invalid.';
      errorResponse.error = 'Bad Request';
      errorResponse.details = exception.getResponse()['message'] || [];
    }

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception.stack; // Include stack trace in development
    }

    return errorResponse;
  }
}
