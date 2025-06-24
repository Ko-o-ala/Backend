import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function RequiredIfOther(
  relatedField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'requiredIfOther',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [relatedField],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedFieldName = args.constraints[0] as string;
          const relatedValue = (args.object as Record<string, any>)[
            relatedFieldName
          ];

          if (relatedValue === 'other') {
            return typeof value === 'string' && value.trim().length > 0;
          }
          return true;
        },
      },
    });
  };
}
