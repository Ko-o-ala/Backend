import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
import { Survey } from './types/survey.type';
import { getMongoDBKSTTime } from '../common/utils/date.util';

const options: SchemaOptions = {};

@Schema(options)
export class User extends Document {
  @ApiProperty({
    example: 'seoin2744',
    description: 'userID',
    required: true,
  })
  @Prop({ required: true, unique: true })
  @IsString()
  @IsNotEmpty()
  userID: string;

  @ApiProperty({
    example: 'seoin',
    description: 'name',
    required: true,
  })
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  @Prop()
  name: string;

  @ApiProperty({
    example: 'seoinPassword1234',
    description: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    example: '2003-08-06',
    description: '생년월일 (YYYY-MM-DD)',
    required: true,
  })
  @Prop({ required: true })
  @IsString()
  birthdate: Date;

  @ApiProperty({
    example: 2,
    description: '성별 (0 = none, 1 = male, 2 = female)',
    required: true,
  })
  @Prop({ required: true })
  @IsIn([0, 1, 2])
  gender: number;

  @Prop({ type: Object })
  survey: Survey;

  @Prop({ type: Object })
  profile: Record<string, any>;

  @Prop({ type: Array, default: [] })
  preferredSounds: Array<{
    filename: string;
    rank: number;
  }>;

  @ApiProperty({
    example: { isHardware: true, RGB: '#FF0000' },
    description: '하드웨어 LED 설정 (옵셔널)',
    required: false,
  })
  @Prop({ type: Object })
  hardware?: {
    isHardware: boolean;
    RGB: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  readonly readOnlyData: {
    id: string;
    userId: string;
    name: string;
    birthdate: Date;
    gender: number;
    survey: object;
    preferredSounds: Array<{
      filename: string;
      rank: number;
    }>;
    hardware?: {
      isHardware: boolean;
      RGB: string;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// 한국 시간대 설정을 위한 pre-save 미들웨어
UserSchema.pre('save', function (next) {
  const now = getMongoDBKSTTime();
  if (this.isNew) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});

UserSchema.virtual('readOnlyData').get(function (this: User) {
  return {
    id: this.id,
    userID: this.userID,
    name: this.name,
    birthdate: this.birthdate,
    gender: this.gender,
    survey: this.survey,
  };
});
