import { ApiProperty, PickType } from '@nestjs/swagger';
// import { User } from '../users.schema';
import { UserUpdateProfileDto } from './users.update-profile.dto';

export class UpdateProfileSwaggerDataDto extends PickType(
  UserUpdateProfileDto,
  ['name', 'gender', 'age'] as const,
) {
  @ApiProperty({
    example: '684e5f89b07fd1bd137a81c0',
    description: 'id',
  })
  id: string;

  @ApiProperty({
    example: 'seoin2744',
    description: 'userID',
  })
  userID: string;
}
