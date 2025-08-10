import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SleepTime {
  @Prop({ required: true })
  startTime: string; // HH:mm

  @Prop({ required: true })
  endTime: string; // HH:mm
}

@Schema({ _id: false })
export class Duration {
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
}

@Schema({ _id: false })
export class Segment {
  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true, enum: ['rem', 'awake', 'deep', 'light'] })
  stage: string;
}

@Schema({ timestamps: true })
export class SleepData extends Document {
  @Prop({ required: true })
  userID: string;

  @Prop({ required: true })
  date: Date; // 'YYYY-MM-DD'

  @Prop({ type: SleepTime, required: true })
  sleepTime: SleepTime;

  @Prop({ type: Duration, required: true })
  Duration: Duration;

  @Prop({ type: [Segment], required: true })
  segments: Segment[];

  @Prop({ required: true })
  sleepScore: number;
}

export const SleepDataSchema = SchemaFactory.createForClass(SleepData);
