import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TenantContextService } from '../../shared/services/tenant-context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, TenantContextService],
  exports: [UserService],
})
export class UserModule {}