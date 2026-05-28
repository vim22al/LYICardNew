import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { Template } from '../api/models/template.model.js';
import { Contact } from '../api/models/contact.model.js';
import { sendEmail } from '../utils/mailer.js';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

export const startEmailWorker = () => {
  const worker = new Worker(
    'single-email',
    async (job: Job) => {
      const { contactId, templateId, to, subject, html, attachments } = job.data;
      
      // Support for direct system emails (like password reset)
      if (to && html) {
        console.log(`🚀 [EmailWorker] Sending direct system email to: ${to}`);
        const success = await sendEmail({ 
          to, 
          subject: subject || 'LYICard Notification', 
          html,
          attachments: attachments || []
        });
        if (!success) throw new Error('System email sending failed');
        return;
      }

      console.log(`🚀 [EmailWorker] Processing single email for contact: ${contactId}`);
      
      try {
        const [contact, template] = await Promise.all([
          Contact.findById(contactId),
          Template.findById(templateId)
        ]);

        if (!contact || !template) {
          console.error(`❌ [EmailWorker] Missing contact (${contactId}) or template (${templateId})`);
          return;
        }

        if (!contact.email) {
          console.error(`❌ [EmailWorker] Contact ${contactId} has no email address`);
          return;
        }

        // Personalization
        let personalizedBody = template.body || '';
        personalizedBody = personalizedBody.replace(/{{name}}/g, contact.name || 'there');
        personalizedBody = personalizedBody.replace(/{{company}}/g, contact.company || '');

        const success = await sendEmail({
          to: contact.email,
          subject: template.subject || 'Follow up from LYICard',
          html: personalizedBody,
          attachments: template.attachments
        });

        if (success) {
          console.log(`✅ [EmailWorker] Successfully sent email to ${contact.email}`);
        } else {
          console.error(`❌ [EmailWorker] Failed to send email to ${contact.email}`);
          throw new Error('Email sending failed');
        }

      } catch (error: any) {
        console.error(`❌ [EmailWorker] Error processing job ${job.id}:`, error.message);
        throw error;
      }
    },
    { 
      connection,
      concurrency: 5 // Higher concurrency for single emails
    }
  );

  worker.on('completed', (job) => {
    console.log(`🏁 [EmailWorker] Job ${job.id} finished!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`🔥 [EmailWorker] Job ${job?.id} failed: ${err.message}`);
  });

  console.log('📡 Single Email Worker started...');
  return worker;
};
