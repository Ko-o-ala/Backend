import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateHardwareDto {
  @ApiProperty({
    example: '#FF0000',
    description: 'RGB 색상값 (hex 형식)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'RGB 색상값은 #으로 시작하는 6자리 hex 형식이어야 합니다.',
  })
  RGB: string;
}

export class HardwareResponseDto {
  @ApiProperty({
    example: 'testuser',
    description: '사용자 ID',
  })
  userID: string;

  @ApiProperty({
    example: true,
    description: '하드웨어 사용 여부',
  })
  isHardware: boolean;

  @ApiProperty({
    example: '#FF0000',
    description: 'RGB 색상값',
  })
  RGB: string;
}
