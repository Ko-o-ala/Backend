import { Module } from '@nestjs/common';
import { SleepDataService } from './service/sleep-data.service';
import { SleepDataController } from './controllers/sleep-data.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SleepData, SleepDataSchema } from './schema/sleep-data.schema';
import {
  MonthAvgSleepData,
  MonthAvgSleepDataSchema,
} from './schema/month-avg-sleep-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SleepData.name, schema: SleepDataSchema },
      { name: MonthAvgSleepData.name, schema: MonthAvgSleepDataSchema },
    ]),
  ],

  providers: [SleepDataService],
  controllers: [SleepDataController],
  exports: [SleepDataService],
})
export class SleepDataModule {}
