import { OmitType } from '@nestjs/swagger';
import { User } from '../users.schema';

export class UserCurrentDto extends OmitType(User, ['password'] as const) {}
