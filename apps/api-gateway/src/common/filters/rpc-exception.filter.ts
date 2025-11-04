import { Catch, RpcExceptionFilter, ArgumentsHost, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcToHttpExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const error = exception.getError();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'Internal Server Error';

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      status = errorObj.statusCode || errorObj.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = errorObj.message || message;
      errorName = errorObj.error || errorName;
    } else if (typeof error === 'string') {
      message = error;
      
      // Parse common error patterns
      if (error.includes('not found') || error.includes('Not found')) {
        status = HttpStatus.NOT_FOUND;
        errorName = 'Not Found';
      } else if (error.includes('unauthorized') || error.includes('Unauthorized')) {
        status = HttpStatus.UNAUTHORIZED;
        errorName = 'Unauthorized';
      } else if (error.includes('forbidden') || error.includes('Forbidden')) {
        status = HttpStatus.FORBIDDEN;
        errorName = 'Forbidden';
      } else if (error.includes('exists') || error.includes('duplicate')) {
        status = HttpStatus.CONFLICT;
        errorName = 'Conflict';
      } else if (error.includes('invalid') || error.includes('Invalid')) {
        status = HttpStatus.BAD_REQUEST;
        errorName = 'Bad Request';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorName,
      message,
    };

    this.logger.error(
      `RPC Error: ${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    response.status(status).json(errorResponse);

    return throwError(() => new HttpException(errorResponse, status));
  }
}
