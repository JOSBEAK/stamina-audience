import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Contact } from '../entities/contact.entity';
import { AudienceList } from '../entities/audience-list.entity';
import { AudienceListMember } from '../entities/audience-list-member.entity';

/**
 * Database configuration factory for TypeORM
 *
 * Provides clean, reusable database configuration following NestJS patterns
 */
export const createDatabaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('TYPEORM_URL'),
  entities: [Contact, AudienceList, AudienceListMember],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Note: disable in production
});
