import { Contact } from '../models/contact.model.js';
import { Campaign } from '../models/campaign.model.js';
import { Template } from '../models/template.model.js';
import mongoose from 'mongoose';
export class DashboardController {
    getDashboardData = async (req, res) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.user?._id);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // 1. Basic Stats & Totals
            const [totalContacts, totalCampaigns, totalTemplates, reachResult,] = await Promise.all([
                Contact.countDocuments({ userId, isDeleted: false }),
                Campaign.countDocuments({ userId, isDeleted: false }),
                Template.countDocuments({ userId, isDeleted: false }),
                Campaign.aggregate([
                    { $match: { userId, isDeleted: false } },
                    { $project: { contactCount: { $size: { $ifNull: ["$contacts", []] } } } },
                    { $group: { _id: null, totalReach: { $sum: "$contactCount" } } }
                ])
            ]);
            // 2. Scans Over Time (Last 7 days)
            const scansOverTime = await Contact.aggregate([
                {
                    $match: {
                        userId,
                        isDeleted: false,
                        createdAt: { $gte: sevenDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);
            // 3. Campaign Status Distribution
            const campaignStatus = await Campaign.aggregate([
                { $match: { userId, isDeleted: false } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);
            // 4. Recent Activity
            const [recentContacts, recentCampaigns] = await Promise.all([
                Contact.find({ userId, isDeleted: false })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('name company email status createdAt'),
                Campaign.find({ userId, isDeleted: false })
                    .sort({ updatedAt: -1 })
                    .limit(5)
                    .select('name status updatedAt')
            ]);
            res.json({
                stats: {
                    totalContacts,
                    totalCampaigns,
                    totalTemplates,
                    totalReach: reachResult[0]?.totalReach || 0,
                },
                analytics: {
                    scansOverTime,
                    campaignStatus,
                },
                recentActivity: {
                    contacts: recentContacts,
                    campaigns: recentCampaigns,
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
