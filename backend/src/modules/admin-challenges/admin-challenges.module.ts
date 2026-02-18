import { Module } from '@nestjs/common';
import { AdminChallengesController } from './admin-challenges.controller';
import { AdminChallengesService } from './admin-challenges.service';

@Module({
  controllers: [AdminChallengesController],
  providers: [AdminChallengesService],
})
export class AdminChallengesModule {}
