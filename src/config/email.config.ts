import * as nodemailer from 'nodemailer';

export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined,
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'sgpm@universidad.edu',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@universidad.edu'
};
