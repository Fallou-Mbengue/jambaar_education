import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { AdminContentModule } from './modules/admin-content/admin-content.module';
import { AdminProgramsModule } from './modules/admin-programs/admin-programs.module';
import { AdminChallengesModule } from './modules/admin-challenges/admin-challenges.module';
import { AdminQuizzesModule } from './modules/admin-quizzes/admin-quizzes.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminBillingModule } from './modules/admin-billing/admin-billing.module';
import { AdminNotificationsModule } from './modules/admin-notifications/admin-notifications.module';
import { AdminAuditModule } from './modules/admin-audit/admin-audit.module';
import { AdminAnalyticsModule } from './modules/admin-analytics/admin-analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    MediaModule,
    AdminContentModule,
    AdminProgramsModule,
    AdminChallengesModule,
    AdminQuizzesModule,
    AdminUsersModule,
    AdminBillingModule,
    AdminNotificationsModule,
    AdminAuditModule,
    AdminAnalyticsModule,
  ],
})
export class AppModule {}
