import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { AuthModule } from '../auth/auth.module';
import { SleepDataModule } from '../sleep-data/sleep-data.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, SleepDataModule, UsersModule],
  controllers: [LlmController],
  providers: [LlmService],
})
export class LlmModule {}
