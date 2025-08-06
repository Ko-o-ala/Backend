import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../users.schema';

export class ReadOnlyUserDto extends PickType(User, [
  'userID',
  'name',
  'gender',
  'birthdate',
] as const) {
  @ApiProperty({
    example: '684e5f89b07fd1bd137a81c0',
    description: 'id',
  })
  id: string;
}
