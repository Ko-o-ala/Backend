import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RecommendSoundRequestDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'seoin2744',
  })
  @IsString()
  @IsNotEmpty()
  userID: string;
}
