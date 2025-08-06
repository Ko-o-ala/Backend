import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { SleepDataService } from '../service/sleep-data.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateSleepDataDto } from '../dto/sleep-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { SleepDataSuccessReturnDto } from '../dto/sleep-data.success.return.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';

@Controller('sleep-data')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class SleepDataController {
  constructor(private readonly sleepDataService: SleepDataService) {}

  @UseGuards(JwtAuthGuard)
  @ApiSuccessResponse(SleepDataSuccessReturnDto)
  @Post()
  @ApiOperation({
    summary: '[finish] 생체 수면 데이터 저장',
    description:
      '윤지언니가 나한테 넘겨줄 때 쓰는 API / Authorization : Bearer + [token] 필요',
  })
  async saveSleepData(@Body() dto: CreateSleepDataDto) {
    return this.sleepDataService.saveSleepData(dto);
  }

  @Get(':userID/:date')
  @ApiOperation({
    summary: '특정 날짜 수면 데이터 조회 (30일 이내)',
    description: '날짜는 YYYY-MM-DD 형식만 허용',
  })
  async getSleepDataByDate(
    @Param('userID') userID: string,
    @Param('date') date: string,
  ) {
    return this.sleepDataService.getSleepDataByDate(userID, date);
  }

  @Delete('auto-cleanup')
  @ApiOperation({ summary: '30일 초과된 수면 데이터 자동 삭제' })
  async deleteOldData() {
    return this.sleepDataService.deleteOldSleepData();
  }

  @Get('user/:userID/last')
  @ApiOperation({
    summary: '오늘 + 어제 밤잠 생체 데이터 조회',
    description:
      '추천 알고리즘에 제공할 오늘과 어제의 최근 밤잠 생체 데이터를 반환합니다.',
  })
  async getLastTwoNightSleeps(@Param('userID') userID: string) {
    const data = await this.sleepDataService.getLastTwoNightSleeps(userID);
    if (!data || data.length === 0) {
      throw new NotFoundException('해당 유저의 최근 밤잠 데이터가 없습니다.');
    }
    return data;
  }
}
