import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class MonthAvgSleepDataId {
  @Prop({ required: true })
  userID: string;

  @Prop({ required: true })
  month: string; // 'YYYY-MM' 형식
}

@Schema({ collection: 'monthAvgSleepData' })
export class MonthAvgSleepData extends Document {
  @Prop({ type: MonthAvgSleepDataId, required: true })
  declare _id: MonthAvgSleepDataId;

  @Prop({ required: true })
  avgSleepScore: number;

  @Prop({ required: true })
  avgTotalSleepDuration: number;
}

export const MonthAvgSleepDataSchema =
  SchemaFactory.createForClass(MonthAvgSleepData);
