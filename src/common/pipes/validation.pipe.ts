import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: any) {
    if (!metatype || metatype === Object) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = this.flattenValidationErrors(errors);
      throw new BadRequestException(`Validation failed: ${messages.join(', ')}`);
    }

    return object; 
  }

  private flattenValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];
    errors.forEach((err) => {
      const constraints = err.constraints ? Object.values(err.constraints) as string[] : [];
      messages.push(...constraints);
    });
    return messages;
  }
}
