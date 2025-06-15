import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

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
    example: '22',
    description: 'age',
    required: true,
  })
  @Prop({ required: true })
  @IsNumber()
  age: number;

  @ApiProperty({
    example: 'female',
    description: 'gender',
    required: true,
  })
  @Prop({ required: true })
  @IsIn(['none', 'female', 'male'])
  gender: string;

  @Prop({ type: Object })
  survey: Record<string, any>;

  @Prop({ type: Object })
  profile: Record<string, any>;

  readonly readOnlyData: {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('readOnlyData').get(function (this: User) {
  return {
    id: this.id,
    userID: this.userID,
    name: this.name,
    age: this.age,
    gender: this.gender,
  };
});
