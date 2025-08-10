import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecommendSoundDocument = RecommendSound & Document;

@Schema({ collection: 'recommendSounds' })
export class RecommendSound {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  recommendation_text: string;

  @Prop({ required: true, type: Array })
  recommended_sounds: Array<{
    filename: string;
    rank: number;
    preference: string;
  }>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const RecommendSoundSchema =
  SchemaFactory.createForClass(RecommendSound);
