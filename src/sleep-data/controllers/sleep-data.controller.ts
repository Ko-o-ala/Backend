import {
  Body,
  Controller,
  Get,
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
import { MonthAvgSleepDataResponseDto } from '../dto/month-avg-sleep-data.response.dto';
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
      '윤지언니가 나한테 넘겨줄 때 쓰는 API / Authorization : Bearer + [token] 필요 / segment의 stage는 light, deep, awake, rem만 가능',
  })
  async saveSleepData(@Body() dto: CreateSleepDataDto) {
    return this.sleepDataService.saveSleepData(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiSuccessResponse(MonthAvgSleepDataResponseDto)
  @Get(':userID/month-avg')
  @ApiOperation({
    summary: '[finish] 월별 평균 수면 데이터 조회',
    description:
      '사용자의 월별 평균 수면 점수와 총 수면 시간을 반환함. / Authorization : Bearer + [token] 필요',
  })
  async getMonthAvgSleepData(@Param('userID') userID: string) {
    return this.sleepDataService.getMonthAvgSleepData(userID);
  }

  @Get(':userID/:date')
  @ApiOperation({
    summary: '[finish] 특정 날짜 수면 데이터 조회',
    description: '날짜는 YYYY-MM-DD 형식만 허용',
  })
  async getSleepDataByDate(
    @Param('userID') userID: string,
    @Param('date') date: string,
  ) {
    return this.sleepDataService.getSleepDataByDate(userID, date);
  }
}
