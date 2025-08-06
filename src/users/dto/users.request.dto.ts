import { PickType } from '@nestjs/swagger';
import { User } from '../users.schema';

export class UserRequestDto extends PickType(User, [
  'userID',
  'name',
  'password',
  'birthdate',
  'gender',
] as const) {}
