import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserUpdateProfileDto } from './users.update-profile.dto';
import { UserSurveyDto } from './user.survey.dto';

class ExistingUserUpdateProfileDto extends PickType(UserUpdateProfileDto, [
  'name',
  'gender',
  'age',
] as const) {}

export class UpdateProfileSwaggerDataDto extends ExistingUserUpdateProfileDto {
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

  @ApiProperty({
    description: 'survey',
    type: UserSurveyDto,
  })
  survey: UserSurveyDto;
}
