import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../users.schema';

export class ReadOnlyUserDto extends PickType(User, [
  'userID',
  'name',
] as const) {
  @ApiProperty({
    example: '12312312',
    description: 'id',
  })
  id: string;
}
