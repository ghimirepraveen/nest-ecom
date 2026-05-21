import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { databaseConfig } from './config/database.config';
import { CustomerModule } from './customer/customer.module';
import { CategoryModule } from './category/category.module';
@Module({
  imports: [
    MongooseModule.forRoot(databaseConfig.uri),
    AuthModule,
    MailModule,
    CustomerModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
