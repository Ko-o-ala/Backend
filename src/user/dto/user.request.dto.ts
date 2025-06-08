import { PickType } from '@nestjs/swagger';
import { User } from '../user.schema';

export class UserRequestDto extends PickType(User, [
  'email',
  'name',
  'password',
] as const) {}
