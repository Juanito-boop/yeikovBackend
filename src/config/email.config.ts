import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export const createEmailTransporter = () => {
  const options: SMTPTransport.Options = {
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined,
    tls: {
      rejectUnauthorized: false
    }
  };

  return nodemailer.createTransport(options);
};

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'sgpm@universidad.edu',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@universidad.edu'
};
