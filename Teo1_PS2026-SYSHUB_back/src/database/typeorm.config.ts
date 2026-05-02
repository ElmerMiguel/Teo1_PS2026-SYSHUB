import path from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
};

const isTsRuntime = (): boolean => {
  return (
    process.argv.some((arg) => arg.includes('ts-node')) ||
    process.argv.some((arg) => arg.includes('typeorm-ts-node')) ||
    process.env.TS_NODE === 'true'
  );
};

const getEntityGlobs = (): string[] => {
  if (isTsRuntime()) {
    return [path.join(process.cwd(), 'src/**/*.entity.ts')];
  }

  return [path.join(process.cwd(), 'dist/**/*.entity.js')];
};

const getMigrationGlobs = (): string[] => {
  if (isTsRuntime()) {
    return [path.join(process.cwd(), 'src/database/migrations/*.ts')];
  }

  return [path.join(process.cwd(), 'dist/database/migrations/*.js')];
};

export const buildDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parsePort(process.env.DB_PORT, 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA ?? 'public',
  synchronize: false,
  logging: false,
  migrationsRun: false,
  entities: getEntityGlobs(),
  migrations: getMigrationGlobs(),
});

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  ...buildDataSourceOptions(),
  autoLoadEntities: true,
});
