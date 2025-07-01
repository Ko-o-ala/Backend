import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SleepData extends Document {
  @Prop({ required: true })
  userID: string;

  @Prop({ required: true })
  date: string; // 'YYYY-MM-DD'

  @Prop({ required: true })
  startTime: string; // HH:mm

  @Prop({ required: true })
  endTime: string; // HH:mm

  @Prop({
    type: [{ start: String, end: String }],
    required: false,
    default: [],
  })
  segments: { start: string; end: string }[];

  @Prop({ required: true })
  totalSleepDuration: number;

  @Prop({ required: true })
  deepSleepDuration: number;

  @Prop({ required: true })
  remSleepDuration: number;

  @Prop({ required: true })
  lightSleepDuration: number;

  @Prop({ required: true })
  awakeDuration: number;

  @Prop({ required: true })
  sleepScore: number;
}

export const SleepDataSchema = SchemaFactory.createForClass(SleepData);
