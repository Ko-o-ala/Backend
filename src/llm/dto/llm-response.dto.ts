import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({
    description: 'MongoDB ObjectId',
    example: '689726ad9dcf5c9a0040c813',
  })
  userId: string;

  @ApiProperty({
    description: '사용자 로그인 ID',
    example: 'minho1991',
  })
  userID: string;

  @ApiProperty({
    description: '사용자 실명',
    example: 'minho',
  })
  name: string;
}

export class CompressionInfoDto {
  @ApiProperty({
    description: '압축 상태 (success 또는 failed)',
    example: 'success',
    enum: ['success', 'failed'],
  })
  status: string;

  @ApiProperty({
    description: '압축 결과 메시지',
    example: '생체 데이터가 성공적으로 압축되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '원본 데이터 크기 (바이트)',
    example: 1294,
  })
  originalSize: number;

  @ApiProperty({
    description: '압축된 데이터 크기 (바이트)',
    example: 438,
  })
  compressedSize: number;

  @ApiProperty({
    description: '압축률 (백분율)',
    example: '66.15%',
  })
  compressionRatio: string;

  @ApiProperty({
    description: '압축 방식',
    example: 'gzip',
  })
  compressionMethod: string;

  @ApiProperty({
    description: '인코딩 방식',
    example: 'base64',
  })
  encoding: string;

  @ApiProperty({
    description: '에러 정보 (압축 실패 시에만)',
    example: '압축 처리 중 오류 발생',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: '참고 사항 (압축 실패 시에만)',
    example: '압축 실패로 인해 데이터 크기가 클 수 있습니다.',
    required: false,
  })
  note?: string;
}

export class LlmResponseDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '토큰 검증 및 생체 데이터 조회가 완료되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '인증된 사용자 정보',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    description: '압축된 생체 데이터 (Base64 인코딩된 gzip 압축 데이터)',
    example:
      'H4sIAAAAAAAAE9VSTUvDQBD9K2XPtUy2u02yN9GLZ3tSpKzNUoNNIslWD6Wg6EEUb14EBQW91y/w4C8y639wNlZMo6DiRWEv+/a9eTM7b0gGmUoX5okgURivJY7vO6ROIpVlsqcQNbtn5uaulh+Nzdnd8944v3qsmb3rp9t7c75jTh/zi9Pa03jbnD+Yk2NzcJ8f7ueHlw2sEUgtiVgekk4YYKGWJzk4bne12/SbynelbAWMSx+Zn7aAcutPgfIZ8GYotAFEcRoAsISMrK/URjuMkDYkmZapfr0Q2hQUkKDiYIKAK5pARnUyP0ilDpPYSnSiZX/RFnlHGQe0RqiCO4B4qqIq7CDcD3truvJAGT7ILbmuSrUBG8hUL1Kxzoqf+aJpO6ydU7+uovDBIaZ1b6wpHSvr7DifyVhF5gjgJRlO+1E14UypeNmsmJmMVibrWewmKcIeq5NuqnClwawubdXx25QK7glgDe5Su9XBRvAdWqezSQTY/srxaslKvPg344UOP4lX9cddi/z1eH2Myb+IF/t1vFzBWg3q8S/iVaZN4oU+xRrnkkGMCjp6AduoxBAwBQAA',
  })
  biometricData: string;

  @ApiProperty({
    description: '압축 정보 및 상태',
    type: CompressionInfoDto,
  })
  _compressionInfo: CompressionInfoDto;
}
