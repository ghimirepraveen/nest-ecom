import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
@Module({
  imports: [MongooseModule.forRoot(databaseConfig.uri), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
