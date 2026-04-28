import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { getTypeOrmConfig } from './database/typeorm.config';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SocialModule } from './modules/social/social.module';
import { AdminModule } from './modules/admin/admin.module';

const isTestEnv = process.env.NODE_ENV === 'test';

const databaseImports = isTestEnv
  ? []
  : [
      TypeOrmModule.forRootAsync({
        useFactory: getTypeOrmConfig,
      }),
    ];

const identityImports = isTestEnv ? [] : [IdentityModule];
const projectsImports = isTestEnv ? [] : [ProjectsModule];
const socialImports = isTestEnv ? [] : [SocialModule];
const adminImports = isTestEnv ? [] : [AdminModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    ...databaseImports,
    HealthModule,
    ...identityImports,
    ...projectsImports,
    ...socialImports,
    ...adminImports,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
