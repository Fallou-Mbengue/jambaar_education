import { Global, Module } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { AdminAuditController } from './admin-audit.controller';

@Global()
@Module({
  providers: [AdminAuditService],
  controllers: [AdminAuditController],
  exports: [AdminAuditService],
})
export class AdminAuditModule {}
