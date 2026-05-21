import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export class HandlebarsAdapter {
  compile(
    mail: {
      data: {
        template: string;
        context?: Record<string, unknown>;
        html?: string;
      };
    },
    callback: (err?: Error) => void,
    mailerOptions: {
      template?: {
        dir?: string;
        options?: CompileOptions;
      };
    },
  ): void {
    const { template, context = {} } = mail.data;
    const templateDir = mailerOptions.template?.dir ?? '';
    const templatePath = path.join(templateDir, `${template}.hbs`);

    try {
      const source = fs.readFileSync(templatePath, 'utf8');
      const compiled = handlebars.compile(
        source,
        mailerOptions.template?.options,
      );
      mail.data.html = compiled(context);
      callback();
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
