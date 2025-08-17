import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RecommendSoundService } from '../service/recommend-sound.service';
import { ExecuteRecommendRequestDto } from '../dto/execute-recommend.request.dto';
import { ExecuteRecommendResponseDto } from '../dto/execute-recommend.response.dto';
import { GetRecommendResultsResponseDto } from '../dto/get-recommend-results.response.dto';
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
    summary: '[finish] 추천 알고리즘 실행',
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

  @Get(':userID/:date/results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[finish] 특정 유저의 특정 날짜 추천 결과 조회',
    description:
      '특정 유저의 특정 날짜에 저장된 추천 결과를 반환합니다. / Authorization : Bearer + [token] 필요',
  })
  @ApiParam({
    name: 'userID',
    description: '사용자 ID',
    example: 'minho1991',
  })
  @ApiParam({
    name: 'date',
    description: '날짜 (YYYY-MM-DD 형식)',
    example: '2025-08-12',
  })
  @ApiResponse({
    status: 200,
    description: '추천 결과가 성공적으로 조회되었습니다.',
    type: GetRecommendResultsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다. (날짜 형식 오류)',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 403,
    description: '권한이 없습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '사용자 또는 추천 결과를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류가 발생했습니다.',
  })
  async getRecommendResults(
    @Param('userID') userID: string,
    @Param('date') date: string,
    @CurrentUser() user: { userID: string },
  ): Promise<GetRecommendResultsResponseDto> {
    // JWT 토큰에서 추출한 사용자 ID와 요청 파라미터의 userID가 일치하는지 확인
    if (user.userID !== userID) {
      throw new HttpException('권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    return await this.recommendSoundService.getRecommendResults(userID, date);
  }
}
