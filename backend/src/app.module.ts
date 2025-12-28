import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { FaviconModule } from './favicon/favicon.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { MatchingModule } from './modules/matching/matching.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SafetyModule } from './modules/safety/safety.module';
import { TrustModule } from './modules/trust/trust.module';
import { AIModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    HealthModule,
    FaviconModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    OnboardingModule,
    MatchingModule,
    MessagesModule,
    SafetyModule,
    TrustModule,
    AIModule,
  ],
})
export class AppModule {}
