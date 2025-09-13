import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { DatabaseModule } from '../common/database/database.module';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Module({
  imports: [DatabaseModule, FirebaseModule],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService, AdminAuthGuard],
})
export class AdminModule {}