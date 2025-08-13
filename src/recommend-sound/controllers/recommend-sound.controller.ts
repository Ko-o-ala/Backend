import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecommendSoundService } from '../service/recommend-sound.service';
import { ExecuteRecommendRequestDto } from '../dto/execute-recommend.request.dto';
import { ExecuteRecommendResponseDto } from '../dto/execute-recommend.response.dto';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('recommend-sound')
@Controller('recommend-sound')
export class RecommendSoundController {
  constructor(private readonly recommendSoundService: RecommendSoundService) {}

  @Post('execute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '추천 알고리즘 실행',
    description:
      '사용자의 설문조사 데이터와 생체 데이터를 기반으로 추천 알고리즘을 실행합니다. / Authorization : Bearer + [token] 필요',
  })
  @ApiResponse({
    status: 200,
    description: '추천 알고리즘이 성공적으로 실행되었습니다.',
    type: ExecuteRecommendResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류가 발생했습니다.',
  })
  async executeRecommend(
    @Body() executeRecommendDto: ExecuteRecommendRequestDto,
    @CurrentUser() user: { userID: string },
  ): Promise<ExecuteRecommendResponseDto> {
    // JWT 토큰에서 추출한 사용자 ID와 요청 바디의 userID가 일치하는지 확인
    if (user.userID !== executeRecommendDto.userID) {
      throw new HttpException('권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    return await this.recommendSoundService.executeRecommend(
      executeRecommendDto,
    );
  }
}
