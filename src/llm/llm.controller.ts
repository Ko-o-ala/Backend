import { Controller, Post, Headers, Res, Body } from '@nestjs/common';
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
const gunzip = promisify(zlib.gunzip);

@ApiTags('LLM 서버 연동')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  /**
   * JWT 토큰을 검증하고 사용자 정보와 통합 데이터를 한 번에 반환합니다.
   * 통합 데이터는 gzip으로 압축되어 전송됩니다.
   */
  @Post('validate-token/get/sleep-data')
  @ApiOperation({
    summary: 'JWT 토큰 검증 및 통합 데이터 조회 (압축)',
    description: `
    LLM 서버에서 받은 JWT 토큰을 검증하고, 
    해당 사용자의 생체 데이터, 설문조사 데이터, 사운드 추천 결과를 통합하여 gzip으로 압축하여 반환합니다.
    
    **처리 과정:**
    1. Bearer 토큰에서 JWT 추출
    2. JWT 토큰 유효성 검증
    3. 사용자 정보 조회
    4. 해당 사용자의 통합 데이터 조회 (생체 데이터 + 설문조사 + 사운드 추천)
    5. 통합 데이터를 gzip으로 압축하여 전송
    
    **압축 정보:**
    - 사용자 정보(user): 압축하지 않음
    - 통합 데이터(integratedData): gzip 압축된 Base64 문자열
      - 생체 데이터(biometricData)
      - 설문조사 데이터(surveyData)
      - 사운드 추천 결과(recommendSoundData)
    - 압축 상태(_compressionInfo): 압축 성공/실패 여부 및 상세 정보
    
    **주의사항:**
    - 최근 30일 제한 없이 전체 생체 데이터 반환
    - 설문조사 데이터는 사용자가 작성한 모든 정보 포함
    - 사운드 추천 결과는 오늘 날짜 기준으로 조회
    - 통합 데이터는 압축된 형태로만 제공 (원본 제거)
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
    description: '토큰 검증 및 통합 데이터 조회 성공 (압축 정보 포함)',
    type: LlmResponseDto,
    schema: {
      example: {
        success: true,
        message: '토큰 검증 및 통합 데이터 조회가 완료되었습니다.',
        user: {
          userId: '689726ad9dcf5c9a0040c813',
          userID: 'minho1991',
          name: 'minho',
        },
        integratedData:
          'H4sIAAAAAAAAE9VSTUvDQBD9K2XPtUy2u02yN9GLZ3tSpKzNUoNNIslWD6Wg6EEUb14EBQW91y/w4C8y639wNlZMo6DiRWEv+/a9eTM7b0gGmUoX5okgURivJY7vO6ROIpVlsqcQNbtn5uaulh+Nzdnd8944v3qsmb3rp9t7c75jTh/zi9Pa03jbnD+Yk2NzcJ8f7ueHlw2sEUgtiVgekk4YYKGWJzk4bne12/SbynelbAWMSx+Zn7aAcutPgfIZ8GYotAFEcRoAsISMrK/URjuMkDYkmZapfr0Q2hQUkKDiYIKAK5pARnUyP0ilDpPYSnSiZX/RFnlHGQe0RqiCO4B4qqIq7CDcD3truvJAGT7ILbmuSrUBG8hUL1Kxzoqf+aJpO6ydU7+uovDBIaZ1b6wpHSvr7DifyVhF5gjgJRlO+1E14UypeNmsmJmMVibrWewmKcIeq5NuqnClwawubdXx25QK7glgDe5Su9XBRvAdWqezSQTY/srxaslKvPg344UOP4lX9cddi/z1eH2Myb+IF/t1vFzBWg3q8S/iVaZN4oU+xRrnkkGMCjp6AduoxBAwBQAA',
        _compressionInfo: {
          status: 'success',
          message: '통합 데이터가 성공적으로 압축되었습니다.',
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

    // 사용자의 통합 데이터 가져오기 (생체 데이터 + 설문조사 + 사운드 추천)
    let integratedData;
    try {
      // eslint-disable-next-line
      integratedData = await this.llmService.getUserAllData(user.userID);
    } catch {
      throw new Error('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    const responseData = {
      success: true,
      message: '토큰 검증 및 통합 데이터 조회가 완료되었습니다.',
      user: {
        userId: user.userId,
        userID: user.userID,
        name: user.name,
      },
    };

    // 통합 데이터 압축 시도
    try {
      // 압축 전 데이터 로깅 (개발용)
      console.log('=== 압축 전 통합 데이터 ===');
      console.log(
        '생체 데이터 개수:',
        integratedData.biometricData?.totalCount || 0,
      );
      console.log('설문조사 데이터 존재:', !!integratedData.surveyData);
      console.log(
        '사운드 추천 결과 존재:',
        !!integratedData.recommendSoundData,
      );
      console.log(
        '전체 데이터 크기:',
        JSON.stringify(integratedData).length,
        'bytes',
      );

      // 실제 데이터 샘플 출력
      console.log(
        '통합 데이터 샘플:',
        JSON.stringify(integratedData, null, 2).substring(0, 500) + '...',
      );
      console.log('========================');

      const compressedData = await gzip(JSON.stringify(integratedData));

      // 압축 정보 계산
      const originalSize = JSON.stringify(integratedData).length;
      const compressedSize = compressedData.length;
      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);

      // 최종 응답 (압축된 데이터만 포함)
      const finalResponse = {
        ...responseData,
        integratedData: compressedData.toString('base64'), // 압축된 데이터만 전달
        _compressionInfo: {
          status: 'success',
          message: '통합 데이터가 성공적으로 압축되었습니다.',
          originalSize,
          compressedSize,
          compressionRatio: compressionRatio + '%',
          compressionMethod: 'gzip',
          encoding: 'base64',
        },
      };

      return res.json(finalResponse);
    } catch (error: unknown) {
      // 압축 실패 시 에러 정보와 함께 원본 데이터 반환
      console.warn('통합 데이터 압축 실패, 원본 데이터 반환:', error);
      return res.json({
        ...responseData,
        integratedData: integratedData, // 압축 실패 시 원본 데이터
        _compressionInfo: {
          status: 'failed',
          message: '압축에 실패하여 원본 데이터를 제공합니다.',
          error: error instanceof Error ? error.message : String(error),
          note: '압축 실패로 인해 데이터 크기가 클 수 있습니다.',
        },
      });
    }
  }

  /**
   * POST 방식으로 압축된 데이터를 해제하는 테스트 엔드포인트
   */
  @Post('decompress-test')
  @ApiOperation({
    summary: '압축된 데이터 해제 테스트',
    description: `
    POST Body로 압축된 데이터를 받아서 해제합니다.
    
    **사용법:**
    1. 실제 API에서 받은 압축된 데이터를 Body에 넣기
    2. 압축 해제 후 원본 데이터 구조 확인
    3. 압축 효율성 검증
    
    **Body 형식:**
    \`\`\`json
    {
      "compressedData": "H4sIAAAAAAAAE9VWXWsbRxT9K2aeHTFa7epj32yrLobQlEoh0BDMePdKWrI7s50POYsR9MPPJSGQBz+0JS4ptA+FPLhNAn3IL4o2/6F3Rit7JYs6bV9a0Ivu3HPvPeeeGemEGAXyoE9CkiV8Ipq9XpNskwyUYmPAaPn1y/KHX8sfn23Nn16U56/fn17Mf3m7VZ7+9u7Vm/LFV+Xzt/Ofnm+9u/iyfPFH+f1Z+fjN/Mm38yc/N7DMUSIy0DKJ+kwzEp7c2Oyb8/L31/+kU+wa3D8hh0mMhdpdFtBmJzqKWr0W9DqMtWM/YD3M3DgCwm1/j3rBLdq95dEhpaH7NCiln2OGSgHyYZKBpaE0k3rxhXit0KOYADyuIrQTtiiZbZO+kUwngluIFpqlA1vkKuoHFFtjaC3epBiXkK2HmxhOk/FErx14Ph6wY/YQarUpDqBgnAHXyilzw9CWrOWpF6twfZDEKm6ZtYLz6zhLZxPMX4M1QxrUYMj2OqrKWUEF9WaOM5k9qNYziITEcNffJpEEXGm8o2tbbfaGnhcG3ZD6jaDj2a2aPP6QtMPDKQmpna9urzZbs1fwgfbCDn/HXuuKd2zkv26v6zb5X9jL/9f26oR+u+F1gxvsVU+r7IV93Br3hOGI8KzCRk6hWL6eborbVrm71YMpRiNSLW1PpEIOIcsBd2TsoISD0ZKlmMFFouBTCSOQwCN7djxJNHxiw9eP7+gJSMzBk0IYbY5gT3CNmx4WudNFZdJZ3bB0F2K9UI+NNEiPZcuTeyieqTxNjmCE4gXuNGbFTqSTaaKLqiA2iYWwNTMhecLHA8MdqY8e5UItyMQsSQs7K8v3JXxhcNBiNXzlTtIMtGhRV0/pvhTHqhjWpuQCs9DTU9RqDGt2JwLD3cnyUh4oZcBanFg33EG4hXI7XcYknuDaIBMWW93AA9RKXip9H+2EaQpBwun6l/lL6fH3b/7qtDz/bqt8/PL92Rmic7cfCbEDDdAk9imaiiSyK4xYmlnhbLhSVbKEbzipbdcR7MMUS6i7CuIFSx058jkgXzeuXfBQ7LM03XEIBGMtkEFWNRiNIOGAPBBxG6aQ2hVo4UUmt7zhEcgIHVbfm4cLOgZ4aDvhbQJu97PrXDKo92jRRZOFiMviGcSJyS5FscrtspQ5wWmjfdXy3gTsSitbLSl/LPBWINfRJaV9pvTi5hcVxwebzH+p3cy+oJHI8P2LnbKLO8pNmq7e4pPVP0HLu71NJkwNardbSwMu+NmGsjingtnsTyXivSKtCQAA"
    }
    \`\`\`
    
    **응답 구조:**
    - success: 성공 여부
    - message: 결과 메시지
    - decompressedData: 해제된 원본 데이터
    - compressionInfo: 압축 정보 (원본 크기, 압축 크기, 압축률)
    `,
  })
  @ApiResponse({
    status: 200,
    description: '압축 해제 성공',
    schema: {
      example: {
        success: true,
        message: '압축 해제가 완료되었습니다.',
        decompressedData: {
          userID: 'minho1991',
          message: '사용자 데이터를 성공적으로 가져왔습니다.',
          biometricData: {
            userID: 'minho1991',
            message: '생체 데이터를 성공적으로 가져왔습니다.',
            data: [
              {
                date: '2025-08-20T00:00:00.000Z',
                sleepScore: 85,
                ratio: {
                  awakeRatio: 0.1,
                  deepSleepRatio: 0.3,
                  lightSleepRatio: 0.4,
                  remSleepRatio: 0.2,
                },
              },
            ],
            totalCount: 1,
          },
          surveyData: {
            sleepQuality: 'good',
            stressLevel: 3,
            exerciseFrequency: 'regular',
          },
          recommendSoundData: {
            userId: 'minho1991',
            date: '2025-08-20',
            recommendation_text: '편안한 숙면을 위한 추천입니다.',
            recommended_sounds: [
              { filename: 'rain.mp3', rank: 1 },
              { filename: 'ocean.mp3', rank: 2 },
            ],
          },
          totalCount: {
            biometricDataCount: 1,
            hasSurveyData: true,
            hasRecommendSoundData: true,
          },
        },
        compressionInfo: {
          originalSize: 1234,
          compressedSize: 567,
          compressionRatio: '54.05%',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (compressedData 누락)',
    schema: {
      example: {
        success: false,
        message: 'compressedData가 필요합니다.',
        debug: {
          body: {},
          bodyType: 'object',
          bodyKeys: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '압축 해제 실패',
    schema: {
      example: {
        success: false,
        message: '압축 해제에 실패했습니다.',
        error: 'invalid bit length repeat',
      },
    },
  })
  async decompressTestPost(@Body() body: { compressedData: string }) {
    try {
      const { compressedData } = body;

      if (!compressedData) {
        return {
          success: false,
          message: 'compressedData가 필요합니다.',
          debug: {
            body: body,
            bodyType: typeof body,
            bodyKeys: Object.keys(body),
          },
        };
      }

      console.log('=== 압축 해제 디버깅 ===');
      console.log('압축된 데이터 길이:', compressedData.length);
      console.log('압축된 데이터 시작 부분:', compressedData.substring(0, 100));

      // Base64 디코딩
      const buffer = Buffer.from(compressedData, 'base64');
      console.log('Base64 디코딩 후 버퍼 크기:', buffer.length);

      // gzip 압축 해제
      const decompressedBuffer = await gunzip(buffer);
      console.log('압축 해제 후 버퍼 크기:', decompressedBuffer.length);

      // JSON 파싱
      const decompressedData = JSON.parse(decompressedBuffer.toString());

      // 압축 정보 계산
      const originalSize = decompressedBuffer.length;
      const compressedSize = buffer.length;
      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);

      return {
        success: true,
        message: '압축 해제가 완료되었습니다.',
        decompressedData,
        compressionInfo: {
          originalSize,
          compressedSize,
          compressionRatio: compressionRatio + '%',
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: '압축 해제에 실패했습니다.',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
