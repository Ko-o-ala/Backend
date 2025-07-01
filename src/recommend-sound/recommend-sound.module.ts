import { Module } from '@nestjs/common';
import { RecommendSoundService } from './recommend-sound.service';
import { RecommendSoundController } from './recommend-sound.controller';

@Module({
  controllers: [RecommendSoundController],
  providers: [RecommendSoundService],
  exports: [RecommendSoundService],
})
export class RecommendSoundModule {}
