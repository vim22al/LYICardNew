import { Campaign } from '../models/campaign.model.js';
export class CampaignController {
    createCampaign = async (req, res) => {
        try {
            const { name, templateId, contacts, scheduledAt } = req.body;
            const campaign = new Campaign({
                userId: req.user?._id,
                name,
                templateId,
                contacts: contacts || [],
                scheduledAt,
            });
            await campaign.save();
            res.status(201).json(campaign);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCampaigns = async (req, res) => {
        try {
            const campaigns = await Campaign.find({ userId: req.user?._id, isDeleted: false })
                .sort({ createdAt: -1 })
                .populate('templateId');
            res.json(campaigns);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getCampaignById = async (req, res) => {
        try {
            const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user?._id, isDeleted: false })
                .populate('templateId')
                .populate('contacts');
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    updateCampaign = async (req, res) => {
        try {
            const updates = req.body;
            const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id, isDeleted: false }, updates, { new: true });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    setCampaignTemplate = async (req, res) => {
        try {
            const { templateId } = req.body;
            const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id, isDeleted: false }, { templateId }, { new: true });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    addContactsToCampaign = async (req, res) => {
        try {
            const { contactIds } = req.body;
            if (!Array.isArray(contactIds)) {
                res.status(400).json({ message: 'contactIds must be an array' });
                return;
            }
            const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id, isDeleted: false }, { $addToSet: { contacts: { $each: contactIds } } }, { new: true });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    removeContactsFromCampaign = async (req, res) => {
        try {
            const { contactIds } = req.body;
            if (!Array.isArray(contactIds)) {
                res.status(400).json({ message: 'contactIds must be an array' });
                return;
            }
            const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id, isDeleted: false }, { $pull: { contacts: { $in: contactIds } } }, { new: true });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteCampaign = async (req, res) => {
        try {
            const campaign = await Campaign.findOneAndUpdate({ _id: req.params.id, userId: req.user?._id }, { isDeleted: true }, { new: true });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            res.json({ message: 'Campaign deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    sendCampaign = async (req, res) => {
        try {
            // 1. Fetch Campaign basic info
            const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user?._id, isDeleted: false });
            if (!campaign) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }
            // 2. Validate basics
            if (!campaign.templateId) {
                res.status(400).json({ message: 'Cannot send campaign: No template selected.' });
                return;
            }
            if (!campaign.contacts || campaign.contacts.length === 0) {
                res.status(400).json({ message: 'Cannot send campaign: No contacts selected.' });
                return;
            }
            // 3. Mark as queued
            campaign.status = 'running';
            campaign.lastSentAt = new Date();
            await campaign.save();
            // 4. Add to BullMQ
            const { campaignQueue } = await import('../../infrastructure/queue/bullmq.js');
            const job = await campaignQueue.add(`campaign-${campaign._id}`, {
                campaignId: campaign._id,
            });
            // Return quickly to the user with Job info
            res.json({
                message: 'Campaign added to queue',
                status: 'running',
                jobId: job.id
            });
        }
        catch (error) {
            console.error(`Campaign queuing failed: ${error.message}`);
            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            }
        }
    };
}
