import { Controller, Post, Headers, Res } from '@nestjs/common';
import { LlmService } from './llm.service';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LlmResponseDto, LlmErrorDto } from './dto';
import { Response } from 'express';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

@ApiTags('LLM 서버 연동')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  /**
   * JWT 토큰을 검증하고 사용자 정보와 생체 데이터를 한 번에 반환합니다.
   * 생체 데이터는 gzip으로 압축되어 전송됩니다.
   */
  @Post('validate-token/get/sleep-data')
  @ApiOperation({
    summary: 'JWT 토큰 검증 및 생체 데이터 조회 (압축)',
    description: `
    LLM 서버에서 받은 JWT 토큰을 검증하고, 
    해당 사용자의 전체 수면 생체 데이터를 gzip으로 압축하여 반환합니다.
    
    **처리 과정:**
    1. Bearer 토큰에서 JWT 추출
    2. JWT 토큰 유효성 검증
    3. 사용자 정보 조회
    4. 해당 사용자의 전체 생체 데이터 조회
    5. 생체 데이터를 gzip으로 압축하여 전송
    
    **압축 정보:**
    - 사용자 정보(user): 압축하지 않음
    - 생체 데이터(biometricData): gzip 압축된 Base64 문자열
    - 압축 상태(_compressionInfo): 압축 성공/실패 여부 및 상세 정보
    
    **주의사항:**
    - 최근 30일 제한 없이 전체 데이터 반환
    - 생체 데이터는 압축된 형태로만 제공 (원본 제거)
    - 토큰이 유효하지 않으면 401 Unauthorized 반환
    `,
  })
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer JWT 토큰',
    required: true,
    example:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Q3OTk0MzkwMTEiLCJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 검증 및 생체 데이터 조회 성공 (압축 정보 포함)',
    type: LlmResponseDto,
    schema: {
      example: {
        success: true,
        message: '토큰 검증 및 생체 데이터 조회가 완료되었습니다.',
        user: {
          userId: '689726ad9dcf5c9a0040c813',
          userID: 'minho1991',
          name: 'minho',
        },
        biometricData:
          'H4sIAAAAAAAAE9VSTUvDQBD9K2XPtUy2u02yN9GLZ3tSpKzNUoNNIslWD6Wg6EEUb14EBQW91y/w4C8y639wNlZMo6DiRWEv+/a9eTM7b0gGmUoX5okgURivJY7vO6ROIpVlsqcQNbtn5uaulh+Nzdnd8944v3qsmb3rp9t7c75jTh/zi9Pa03jbnD+Yk2NzcJ8f7ueHlw2sEUgtiVgekk4YYKGWJzk4bne12/SbynelbAWMSx+Zn7aAcutPgfIZ8GYotAFEcRoAsISMrK/URjuMkDYkmZapfr0Q2hQUkKDiYIKAK5pARnUyP0ilDpPYSnSiZX/RFnlHGQe0RqiCO4B4qqIq7CDcD3truvJAGT7ILbmuSrUBG8hUL1Kxzoqf+aJpO6ydU7+uovDBIaZ1b6wpHSvr7DifyVhF5gjgJRlO+1E14UypeNmsmJmMVibrWewmKcIeq5NuqnClwawubdXx25QK7glgDe5Su9XBRvAdWqezSQTY/srxaslKvPg344UOP4lX9cddi/z1eH2Myb+IF/t1vFzBWg3q8S/iVaZN4oU+xRrnkkGMCjp6AduoxBAwBQAA',
        _compressionInfo: {
          status: 'success',
          message: '생체 데이터가 성공적으로 압축되었습니다.',
          originalSize: 1294,
          compressedSize: 438,
          compressionRatio: '66.15%',
          compressionMethod: 'gzip',
          encoding: 'base64',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: LlmErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: LlmErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자 또는 데이터를 찾을 수 없음',
    type: LlmErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
    type: LlmErrorDto,
  })
  async validateTokenAndGetSleepData(
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Bearer 토큰이 필요합니다.');
    }

    // 토큰 검증 및 사용자 정보 가져오기
    const user = await this.llmService.validateTokenAndGetUser(authHeader);

    // 사용자의 생체 데이터 가져오기
    const biometricData = await this.llmService.getUserBiometricData(
      user.userID,
    );

    const responseData = {
      success: true,
      message: '토큰 검증 및 생체 데이터 조회가 완료되었습니다.',
      user: {
        userId: user.userId,
        userID: user.userID,
        name: user.name,
      },
    };

    // 생체 데이터 압축 시도
    try {
      const compressedData = await gzip(JSON.stringify(biometricData));

      // 압축 정보 계산
      const originalSize = JSON.stringify(biometricData).length;
      const compressedSize = compressedData.length;
      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);

      // 최종 응답 (압축된 데이터만 포함)
      const finalResponse = {
        ...responseData,
        biometricData: compressedData.toString('base64'), // 압축된 데이터만 전달
        _compressionInfo: {
          status: 'success',
          message: '생체 데이터가 성공적으로 압축되었습니다.',
          originalSize,
          compressedSize,
          compressionRatio: compressionRatio + '%',
          compressionMethod: 'gzip',
          encoding: 'base64',
        },
      };

      return res.json(finalResponse);
    } catch (error) {
      // 압축 실패 시 에러 정보와 함께 원본 데이터 반환
      console.warn('생체 데이터 압축 실패, 원본 데이터 반환:', error);
      return res.json({
        ...responseData,
        biometricData: biometricData, // 압축 실패 시 원본 데이터
        _compressionInfo: {
          status: 'failed',
          message: '압축에 실패하여 원본 데이터를 제공합니다.',
          error: String(error),
          note: '압축 실패로 인해 데이터 크기가 클 수 있습니다.',
        },
      });
    }
  }
}
