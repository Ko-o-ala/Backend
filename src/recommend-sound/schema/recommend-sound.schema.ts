import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { getMongoDBKSTTime } from '../../common/utils/date.util';

@Schema({ _id: false })
export class RecommendedSound {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  rank: number;
}

@Schema({ collection: 'recommendSounds' })
export class RecommendSound extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  recommendation_text: string;

  @Prop({ type: [RecommendedSound], required: true })
  recommended_sounds: RecommendedSound[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RecommendSoundSchema =
  SchemaFactory.createForClass(RecommendSound);

// 한국 시간대 설정을 위한 pre-save 미들웨어
RecommendSoundSchema.pre('save', function (next) {
  const now = getMongoDBKSTTime();
  if (this.isNew) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});
