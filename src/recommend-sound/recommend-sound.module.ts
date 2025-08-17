import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { RecommendSoundController } from './controllers/recommend-sound.controller';
import { RecommendSoundService } from './service/recommend-sound.service';
import {
  RecommendSound,
  RecommendSoundSchema,
} from './schema/recommend-sound.schema';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecommendSound.name, schema: RecommendSoundSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule,
  ],
  controllers: [RecommendSoundController],
  providers: [RecommendSoundService],
  exports: [RecommendSoundService],
})
export class RecommendSoundModule {}
