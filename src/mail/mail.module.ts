import { Module, DynamicModule } from '@nestjs/common';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from './handlebars.adapter';
import * as path from 'path';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

const mailerModule: DynamicModule = (
  MailerModule as { forRoot: (options: MailerOptions) => DynamicModule }
).forRoot({
  transport: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  defaults: {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
  },
  template: {
    dir: path.join(__dirname, 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});

@Module({
  imports: [mailerModule],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
