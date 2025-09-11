import { PickType } from '@nestjs/swagger';
import { User } from '../users.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UserRequestDto extends PickType(User, [
  'name',
  'password',
  'birthdate',
  'gender',
] as const) {
  @ApiProperty({
    example: 'seoin2744',
    description: 'userID (영어와 숫자만 허용)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'userID는 영어와 숫자만 사용할 수 있습니다.',
  })
  userID: string;
}
