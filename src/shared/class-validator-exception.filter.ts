import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isArray, isEmpty, last } from 'lodash';

@Catch()
export class ClassValidatorExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let errResData: any = null;
    if (!isEmpty(exception) && !isEmpty(exception.getResponse())) {
      const errorResp: any = exception.getResponse();
      if (!isEmpty(errorResp.message)) {
        if (isArray(errorResp.message)) {
          errResData = last(errorResp.message);
        } else {
          errResData = errorResp.message;
        }
      }
    }
    response.status(status).json({
      message: errResData ? errResData : {},
      error: exception.message || 'INTERNAL_SERVER_ERROR',
      status: false,
    });
  }
}
