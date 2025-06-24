import { PartialType } from '@nestjs/swagger';
import { UserSurveyDto } from './user.survey.dto';

export class UserModifySurveyDto extends PartialType(UserSurveyDto) {}
