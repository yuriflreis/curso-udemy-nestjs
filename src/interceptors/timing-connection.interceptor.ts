import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

export class TimingConnectionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return next.handle().pipe(tap(() => {}));
  }
}
