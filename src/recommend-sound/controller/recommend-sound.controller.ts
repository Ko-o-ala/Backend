import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SuccessInterceptor } from '../../common/interceptors/success.interceptor';
import { HttpExceptionFilter } from '../../common/exceptions/http-exception.filter';
import { RecommendSoundService } from '../service/recommend-sound.service';
import { RecommendSoundRequestDto } from '../dto/recommend-sound.request.dto';
import { RecommendSoundResponseDto } from '../dto/recommend-sound.response.dto';

@ApiTags('추천 음악')
@Controller('recommend-sound')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class RecommendSoundController {
  constructor(private readonly recommendSoundService: RecommendSoundService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '음악 추천 실행',
    description: '사용자의 설문조사 데이터를 기반으로 음악을 추천합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '추천 성공',
    type: RecommendSoundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (설문조사 데이터 없음)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 503,
    description: '추천 알고리즘 서버 연결 실패',
  })
  async executeRecommendation(
    @Body() requestDto: RecommendSoundRequestDto,
    @CurrentUser() user: { userID: string },
  ): Promise<RecommendSoundResponseDto> {
    // JWT 토큰에서 추출한 사용자 ID와 요청 본문의 사용자 ID가 일치하는지 확인
    if (user.userID !== requestDto.userID) {
      throw new Error('사용자 ID가 일치하지 않습니다.');
    }

    return await this.recommendSoundService.executeRecommendation(requestDto);
  }
}
