import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SleepData } from '../sleep-data.schema';
import { CreateSleepDataDto } from '../dto/sleep-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { SleepDataItem } from '../sleep-data.interface';

@Injectable()
export class SleepDataService {
  constructor(
    @InjectModel(SleepData.name) private readonly sleepModel: Model<SleepData>,
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
      const current = grouped.get(item.date);
      if (current) {
        current.push(item);
      } else {
        grouped.set(item.date, [item]);
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

  async deleteOldSleepData() {
    const thresholdDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');

    const result = await this.sleepModel.deleteMany({
      date: { $lt: thresholdDate },
    });

    return {
      deletedCount: result.deletedCount,
      message: '30일이 지난 수면 데이터가 성공적으로 삭제되었습니다.',
    };
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
      data.map((d) => this.parseTimeToMinutes(d.startTime)),
    );
    const avgEndMinutes = average(
      data.map((d) => this.parseTimeToMinutes(d.endTime)),
    );

    const result = {
      userID,
      averageStartTime: this.formatMinutesToHHMM(avgStartMinutes),
      averageEndTime: this.formatMinutesToHHMM(avgEndMinutes),
      averageWakeCount: average(
        data.map((d) => (d.segments?.length ? d.segments.length - 1 : 0)),
      ),
      averageTotalSleepDuration: average(data.map((d) => d.totalSleepDuration)),
      averageDeepSleepDuration: average(data.map((d) => d.deepSleepDuration)),
      averageRemSleepDuration: average(data.map((d) => d.remSleepDuration)),
      averageLightSleepDuration: average(data.map((d) => d.lightSleepDuration)),
      averageAwakeDuration: average(data.map((d) => d.awakeDuration)),
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
    const { userID, date, startTime } = dto;

    // 중복 저장 방지: userID + date + startTime 기준
    const exists = await this.sleepModel.findOne({
      userID,
      date,
      startTime,
    });

    if (exists) {
      throw new ConflictException(
        '이미 시작 시간이 같은 동일한 수면 데이터가 존재합니다.',
      );
    }

    await this.sleepModel.create(dto);
    return { message: '생체 수면 데이터가 성공적으로 저장되었습니다.' };
  }
}
