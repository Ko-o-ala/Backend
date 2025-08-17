import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class RecommendedSound {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  rank: number;
}

@Schema({ timestamps: true, collection: 'recommendSounds' })
export class RecommendSound extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  recommendation_text: string;

  @Prop({ type: [RecommendedSound], required: true })
  recommended_sounds: RecommendedSound[];
}

export const RecommendSoundSchema =
  SchemaFactory.createForClass(RecommendSound);
