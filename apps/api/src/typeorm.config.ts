import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: 'apps/api/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.TYPEORM_URL,
  entities: ['apps/api/src/entities/**/*.entity.ts'],
  migrations: ['apps/api/src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
