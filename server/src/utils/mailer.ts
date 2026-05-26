import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { Config } from '../api/models/config.model.js';

let transporter: nodemailer.Transporter | null = null;

export const resetTransporter = () => {
  transporter = null;
};

const getTransporter = async () => {
  if (transporter) return transporter;

  // Try to get SMTP config from database first
  const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const dbConfigs = await Config.find({ key: { $in: smtpKeys } });
  
  const configMap = dbConfigs.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const host = configMap.SMTP_HOST || env.SMTP_HOST;
  const port = configMap.SMTP_PORT || env.SMTP_PORT;
  const user = configMap.SMTP_USER || env.SMTP_USER;
  const pass = configMap.SMTP_PASS || env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });
  } else {
    console.warn('⚠️ No SMTP credentials found in DB or ENV. Creating fallback Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject?: string;
  html: string;
  attachments?: any[];
}): Promise<boolean> => {
  try {
    const t = await getTransporter();

    if (!t) {
      console.error('❌ Failed to initialize email transporter');
      return false;
    }

    // Get the user to use in the FROM field
    const host = transporter?.options && 'host' in transporter.options ? transporter.options.host : '';
    const user = transporter?.options && 'auth' in transporter.options && (transporter.options.auth as any).user ? (transporter.options.auth as any).user : 'noreply@lyicard.example.com';

    const info = await t.sendMail({
      from: `"LYICard" <${user}>`,
      to,
      subject: subject || 'LYICard Notification',
      html,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      }))
    });

    console.log(`✉️ Email successfully sent to ${to}. MessageId: ${info.messageId}`);

    // Log nodemailer ethereal test URL if we are using ethereal
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log(`🌐 Preview available at: ${testUrl}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return false;
  }
};
