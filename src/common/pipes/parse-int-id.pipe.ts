import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parseValue = Number(value);

    if (isNaN(parseValue)) {
      throw new BadRequestException(
        'ParseIntIdPipe espera uma string numerica!',
      );
    }

    if (parseValue < 0) {
      throw new BadRequestException(
        'ParseIntIdPipe espera um numero maior que zero!',
      );
    }

    return parseValue;
  }
}
