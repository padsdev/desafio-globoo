import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class RpcExceptionFilterService implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilterService.name);

  catch(exception: RpcException | any, host: ArgumentsHost): Observable<any> {
    let error: any;

    if (exception instanceof RpcException) {
      error = exception.getError();
    } else if (exception instanceof Error) {
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
      error = {
        statusCode: 500,
        error: 'Internal Server Error',
        message: exception.message || 'Internal server error',
      };
    } else {
      this.logger.error(`Unknown error type: ${JSON.stringify(exception)}`);
      error = {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      };
    }

    // Ensure error has proper structure
    if (typeof error === 'string') {
      error = {
        statusCode: 500,
        error: 'Error',
        message: error,
      };
    } else if (typeof error === 'object' && !error.statusCode) {
      error = {
        statusCode: 500,
        error: error.error || 'Internal Server Error',
        message: error.message || 'Internal server error',
      };
    }

    this.logger.error(
      `RPC Exception - Status: ${error.statusCode} - Message: ${error.message}`,
    );

    return throwError(() => error);
  }
}
