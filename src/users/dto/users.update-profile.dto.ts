import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

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
    description: 'new age',
    example: 18,
  })
  @IsOptional()
  @IsNumber()
  age: number;

  @ApiPropertyOptional({
    description: 'new gender',
    example: 'none',
  })
  @IsOptional()
  @IsIn(['none', 'female', 'male'])
  gender: string;
}
