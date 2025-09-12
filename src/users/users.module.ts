import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/database/database.module';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Module({
  imports: [AuthModule, DatabaseModule, FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}