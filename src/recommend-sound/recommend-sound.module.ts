import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { RecommendSoundService } from './service/recommend-sound.service';
import { RecommendSoundController } from './controller/recommend-sound.controller';
import { RecommendSound, RecommendSoundSchema } from './recommend-sound.schema';
import { UsersModule } from '../users/users.module';
import { SleepDataModule } from '../sleep-data/sleep-data.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecommendSound.name, schema: RecommendSoundSchema },
    ]),
    HttpModule,
    UsersModule,
    SleepDataModule,
  ],
  controllers: [RecommendSoundController],
  providers: [RecommendSoundService],
  exports: [RecommendSoundService],
})
export class RecommendSoundModule {}
