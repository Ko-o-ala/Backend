import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../user.schema';

export class ReadOnlyUserDto extends PickType(User, [
  'email',
  'name',
] as const) {
  @ApiProperty({
    example: '12312312',
    description: 'id',
  })
  id: string;
}
