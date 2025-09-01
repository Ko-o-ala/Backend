import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SleepData } from '../schema/sleep-data.schema';
import { MonthAvgSleepData } from '../schema/month-avg-sleep-data.schema';
import { CreateSleepDataDto } from '../dto/sleep-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';

@Injectable()
export class SleepDataService {
  constructor(
    @InjectModel(SleepData.name) private readonly sleepModel: Model<SleepData>,
    @InjectModel(MonthAvgSleepData.name)
    private readonly monthAvgModel: Model<MonthAvgSleepData>,
  ) {}

  async getSleepDataByDate(userID: string, date: string) {
    const targetDate = dayjs(date);

    if (!targetDate.isValid()) {
      throw new BadRequestException(
        '유효하지 않은 날짜 형식입니다. (YYYY-MM-DD)',
      );
    }

    const data = await this.sleepModel.find({ userID, date });

    if (!data || data.length === 0) {
      throw new NotFoundException(
        '해당 날짜의 수면 데이터를 찾을 수 없습니다.',
      );
    }

    return data;
  }

  async getRecentAverages(userID: string) {
    const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

    const data = await this.sleepModel.find({
      userID,
      date: { $gte: sevenDaysAgo },
    });

    if (data.length === 0) {
      return { message: '최근 7일간 수면 데이터가 없습니다.' };
    }

    // 평균 계산 도우미
    const average = (nums: number[]) =>
      nums.length > 0
        ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
        : 0;

    const avgStartMinutes = average(
      data.map((d) => this.parseTimeToMinutes(d.sleepTime.startTime)),
    );
    const avgEndMinutes = average(
      data.map((d) => this.parseTimeToMinutes(d.sleepTime.endTime)),
    );

    const result = {
      userID,
      averageStartTime: this.formatMinutesToHHMM(avgStartMinutes),
      averageEndTime: this.formatMinutesToHHMM(avgEndMinutes),
      averageTotalSleepDuration: average(
        data.map((d) => d.Duration.totalSleepDuration),
      ),
      averageDeepSleepDuration: average(
        data.map((d) => d.Duration.deepSleepDuration),
      ),
      averageRemSleepDuration: average(
        data.map((d) => d.Duration.remSleepDuration),
      ),
      averageLightSleepDuration: average(
        data.map((d) => d.Duration.lightSleepDuration),
      ),
      averageAwakeDuration: average(data.map((d) => d.Duration.awakeDuration)),
      averageSleepScore: average(data.map((d) => d.sleepScore)),
    };

    return result;
  }

  parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  formatMinutesToHHMM(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  async saveSleepData(dto: CreateSleepDataDto) {
    const { userID, date, sleepTime, Duration, segments, sleepScore } = dto;

    const dateObject = new Date(date);

    // 중복 저장 방지: 같은 userID + 같은 date + 같은 startTime인 경우만 중복으로 처리
    const exists = await this.sleepModel.findOne({
      userID,
      date: dateObject,
      'sleepTime.startTime': sleepTime.startTime,
    });

    if (exists) {
      throw new ConflictException(
        '해당 사용자의 같은 날짜에 이미 시작 시간이 같은 수면 데이터가 존재합니다.',
      );
    }

    // 새로운 구조 그대로 저장
    const sleepData = {
      userID,
      date: dateObject,
      sleepTime,
      Duration,
      segments,
      sleepScore,
    };

    await this.sleepModel.create(sleepData);
    return { message: '생체 수면 데이터가 성공적으로 저장되었습니다.' };
  }

  async getMonthAvgSleepData(userID: string) {
    const data = await this.monthAvgModel
      .find({ '_id.userID': userID })
      .sort({ '_id.month': -1 })
      .lean();

    if (!data || data.length === 0) {
      throw new NotFoundException(
        '해당 사용자의 월별 평균 수면 데이터를 찾을 수 없습니다.',
      );
    }

    return data.map((item) => ({
      userID: item._id.userID,
      month: item._id.month,
      avgSleepScore: item.avgSleepScore,
      avgTotalSleepDuration: item.avgTotalSleepDuration,
    }));
  }

  // 사용자 ID로 모든 수면 데이터를 가져옴.
  async getAllSleepDataByUserID(userID: string) {
    const data = await this.sleepModel
      .find({ userID })
      .sort({ date: -1 })
      .lean();

    return data;
  }
}
