import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(params: {
    subject: string;
    template: string;
    context: {
      email: string;
      otp: string;
      expiresIn: number;
    };
  }) {
    try {
      const recipient = params.context.email;
      const sendMailParams: ISendMailOptions = {
        to: recipient,
        from: process.env.SMTP_FROM,
        subject: params.subject,
        template: params.template,
        context: params.context,
      };

      await this.mailerService.sendMail(sendMailParams);
      this.logger.log(`Email sent successfully to ${recipient}`);
      return true;
    } catch (err) {
      this.logger.error('Failed to send email', err);
      throw err;
    }
  }

  async sendRawEmail(params: {
    to?: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      const recipient = params.to ?? process.env.SMTP_TO;

      if (!recipient) {
        throw new Error('No recipient provided (to param or SMTP_TO env)');
      }

      const sendMailParams: ISendMailOptions = {
        to: recipient,
        from: process.env.SMTP_FROM,
        subject: params.subject,
        text: params.text,
        html: params.html,
      };

      await this.mailerService.sendMail(sendMailParams);
      this.logger.log(`Raw email sent: ${JSON.stringify(sendMailParams)}`);
      return true;
    } catch (error) {
      this.logger.error('Error while sending raw email', error);
      throw error;
    }
  }
}
