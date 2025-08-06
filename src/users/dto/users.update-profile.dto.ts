import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UserUpdateProfileDto {
  @ApiPropertyOptional({
    description: 'new name',
    example: '귀요미',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'new password',
    example: 'seoinNewPassword1398!',
  })
  @IsOptional()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'new birthdate',
    example: '2003-08-06',
  })
  @IsOptional()
  @IsString()
  birthdate: string;

  @ApiPropertyOptional({
    description: 'new gender (0 = none, 1 = male, 2 = female)',
    example: 2,
  })
  @IsOptional()
  @IsIn([0, 1, 2])
  gender: number;
}
