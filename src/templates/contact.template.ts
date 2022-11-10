import config from '../config';

interface Message {
  email: string;
  name: string;
  subject: string;
  message: string;
}

export function contactTemplate(message: Message): string {
  return `
  <html>
      <body>
        <p>Hello ${config.enterpriseName},</p>
        <p>Je suis ${message.name}, adresse mail: <a href="mailto:${message.email}">${message.email}</a></p>
        <p>J'écris au sujet de: ${message.subject}</p>
        <p>${message.message}</p>
      </body>
    </html>
  `;
}
