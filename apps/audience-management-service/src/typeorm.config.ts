import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: 'apps/audience-management-service/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.TYPEORM_URL,
  entities: ['apps/audience-management-service/src/entities/**/*.entity.ts'],
  migrations: ['apps/audience-management-service/src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
