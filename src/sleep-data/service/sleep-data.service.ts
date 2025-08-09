import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SleepData } from '../sleep-data.schema';
import { MonthAvgSleepData } from '../month-avg-sleep-data.schema';
import { CreateSleepDataDto } from '../dto/sleep-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { SleepDataItem } from '../sleep-data.interface';

@Injectable()
export class SleepDataService {
  constructor(
    @InjectModel(SleepData.name) private readonly sleepModel: Model<SleepData>,
    @InjectModel(MonthAvgSleepData.name)
    private readonly monthAvgModel: Model<MonthAvgSleepData>,
  ) {}

  async getLastTwoNightSleeps(userID: string) {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    const raw = await this.sleepModel
      .find({
        userID,
        date: { $in: [today, yesterday] },
      })
      .sort({ date: -1, startTime: -1 })
      .lean();

    const grouped = new Map<string, SleepDataItem[]>();

    const sleepItems = raw as SleepDataItem[];

    for (const item of sleepItems) {
      const dateKey = dayjs(item.date).format('YYYY-MM-DD');
      const current = grouped.get(dateKey);
      if (current) {
        current.push(item);
      } else {
        grouped.set(dateKey, [item]);
      }
    }

    const result: SleepDataItem[] = [];
    for (const date of [today, yesterday]) {
      const items = grouped.get(date);
      if (Array.isArray(items) && items.length > 0) {
        result.push(items[0]); // 가장 늦게 시작한 밤잠
      }
    }

    return result;
  }

  @Cron('0 15 * * *') // 매일 오후 3시 (서버 시간 기준)
  async autoCleanup() {
    const thresholdDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');

    const result = await this.sleepModel.deleteMany({
      date: { $lt: thresholdDate },
    });

    console.log(
      `[AUTO CLEANUP] Deleted ${result.deletedCount} entries older than 30 days`,
    );
  }

  async getSleepDataByDate(userID: string, date: string) {
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const targetDate = dayjs(date);

    if (!targetDate.isValid()) {
      throw new BadRequestException(
        '유효하지 않은 날짜 형식입니다. (YYYY-MM-DD)',
      );
    }

    if (targetDate.isBefore(thirtyDaysAgo)) {
      throw new BadRequestException('30일 이전의 데이터는 조회할 수 없습니다.');
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

    // 문자열 date를 Date 객체로 변환
    const dateObject = new Date(date);

    // 중복 저장 방지: userID + date + startTime 기준
    const exists = await this.sleepModel.findOne({
      userID,
      date: dateObject,
      'sleepTime.startTime': sleepTime.startTime,
    });

    if (exists) {
      throw new ConflictException(
        '이미 시작 시간이 같은 동일한 수면 데이터가 존재합니다.',
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
}
