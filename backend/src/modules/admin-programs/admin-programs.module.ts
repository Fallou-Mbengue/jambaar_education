import { Module } from '@nestjs/common';
import { AdminProgramsController } from './admin-programs.controller';
import { AdminProgramsService } from './admin-programs.service';

@Module({
  controllers: [AdminProgramsController],
  providers: [AdminProgramsService],
})
export class AdminProgramsModule {}
