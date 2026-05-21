import {
  Controller,
  Get,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async test(
    @Query('to') to?: string,
    @Query('subject') subject = 'Test email',
  ) {
    try {
      await this.mailService.sendRawEmail({
        to,
        subject,
        text: 'This is a test email from your Nest app',
      });

      return { success: true };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unknown error sending email';
      throw new InternalServerErrorException(msg);
    }
  }
}
