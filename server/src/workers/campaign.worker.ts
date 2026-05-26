import { Worker, Job } from 'bullmq';
import { redis } from '../infrastructure/redis/index.js';
import { Campaign } from '../api/models/campaign.model.js';
import { sendEmail } from '../utils/mailer.js';

export const startCampaignWorker = () => {
  const worker = new Worker(
    'campaign',
    async (job: Job) => {
      const { campaignId } = job.data;
      
      console.log(`🚀 [Worker] Starting campaign: ${campaignId}`);
      
      try {
        // 1. Fetch Campaign fully populated
        const campaign = await Campaign.findOne({ _id: campaignId, isDeleted: false })
          .populate('templateId')
          .populate('contacts');

        if (!campaign) {
          console.error(`❌ [Worker] Campaign not found: ${campaignId}`);
          return;
        }

        if (!campaign.templateId || !campaign.contacts || campaign.contacts.length === 0) {
          console.error(`❌ [Worker] Campaign ${campaignId} missing template or contacts.`);
          campaign.status = 'failed';
          await campaign.save();
          return;
        }

        // 2. Mark as running
        campaign.status = 'running';
        await campaign.save();

        const template: any = campaign.templateId;
        let successCount = 0;
        
        // 3. Process contacts
        for (const contact of campaign.contacts as any) {
          if (!contact.email) continue;
          
          // Simple personalization
          let personalizedBody = template.body || '';
          personalizedBody = personalizedBody.replace(/{{name}}/g, contact.firstName || 'there');
          personalizedBody = personalizedBody.replace(/{{company}}/g, contact.company || '');

          const success = await sendEmail({
            to: contact.email,
            subject: template.subject || campaign.name,
            html: personalizedBody,
            attachments: template.attachments
          });

          if (success) successCount++;
          
          // Update progress on job
          const progress = Math.round((successCount / campaign.contacts.length) * 100);
          await job.updateProgress(progress);
        }

        // 4. Final Update
        campaign.status = successCount > 0 ? 'completed' : 'failed';
        await campaign.save();
        
        console.log(`✅ [Worker] Campaign ${campaignId} finished. Success count: ${successCount}`);

      } catch (error: any) {
        console.error(`❌ [Worker] Campaign ${campaignId} failed:`, error.message);
        await Campaign.updateOne({ _id: campaignId }, { status: 'failed' });
        throw error; // Let BullMQ handle retries if configured
      }
    },
    { 
      connection: redis,
      concurrency: 1 // Process one campaign at a time to stay safe with mail servers
    }
  );

  worker.on('completed', (job) => {
    console.log(`🏁 [Worker] Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`🔥 [Worker] Job ${job?.id} failed with ${err.message}`);
  });

  console.log('📡 Campaign Worker started and listening for jobs...');
  return worker;
};
