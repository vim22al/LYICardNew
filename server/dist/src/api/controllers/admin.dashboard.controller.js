import { User } from '../models/user.model.js';
import { Contact } from '../models/contact.model.js';
import { defaultQueue, campaignQueue, singleEmailQueue } from '../../infrastructure/queue/bullmq.js';
import { rabbitChannel } from '../../infrastructure/queue/rabbitmq.js';
export class AdminDashboardController {
    getStats = async (req, res) => {
        try {
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [totalUsers, activeUsersDaily, activeUsersMonthly, newUsersToday, newUsersLast7Days, totalCardsProcessed, totalContactsExtracted, extractionStats, planDistribution,] = await Promise.all([
                User.countDocuments({ userType: 'user' }),
                User.countDocuments({ userType: 'user', createdAt: { $gte: todayStart } }), // Simplified active today
                User.countDocuments({ userType: 'user', createdAt: { $gte: thirtyDaysAgo } }), // Simplified monthly active
                User.countDocuments({ userType: 'user', createdAt: { $gte: todayStart } }),
                User.countDocuments({ userType: 'user', createdAt: { $gte: sevenDaysAgo } }),
                Contact.countDocuments({ isDeleted: false }),
                Contact.countDocuments({ status: 'completed', isDeleted: false }),
                Contact.aggregate([
                    { $match: { isDeleted: false } },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                User.aggregate([
                    { $match: { userType: 'user' } },
                    { $group: { _id: '$subscriptionType', count: { $sum: 1 } } }
                ])
            ]);
            const successCount = extractionStats.find(s => s._id === 'completed')?.count || 0;
            const failedCount = extractionStats.find(s => s._id === 'failed')?.count || 0;
            const totalExtraction = successCount + failedCount;
            const extractionSuccessRate = totalExtraction > 0 ? (successCount / totalExtraction) * 100 : 0;
            res.json({
                totalUsers,
                activeUsers: { daily: activeUsersDaily, monthly: activeUsersMonthly },
                newUsers: { today: newUsersToday, last7Days: newUsersLast7Days },
                totalCardsProcessed,
                totalContactsExtracted,
                extractionSuccessRate: extractionSuccessRate.toFixed(2),
                extractionFailureRate: (100 - extractionSuccessRate).toFixed(2),
                mrr: 0, // Placeholder as revenue is not tracked yet in models
                conversionRate: 0, // Placeholder
                planDistribution
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getGrowthData = async (req, res) => {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const userGrowth = await User.aggregate([
                { $match: { userType: 'user', createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            const cardUploads = await Contact.aggregate([
                { $match: { isDeleted: false, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            res.json({ userGrowth, cardUploads });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getSystemHealth = async (req, res) => {
        try {
            const [defaultCounts, campaignCounts, emailCounts,] = await Promise.all([
                defaultQueue.getJobCounts(),
                campaignQueue.getJobCounts(),
                singleEmailQueue.getJobCounts(),
            ]);
            let rabbitStats = { messageCount: 0, consumerCount: 0 };
            if (rabbitChannel) {
                try {
                    const qInfo = await rabbitChannel.checkQueue('extract-image-queue');
                    rabbitStats = { messageCount: qInfo.messageCount, consumerCount: qInfo.consumerCount };
                }
                catch (e) {
                    console.error('RabbitMQ health check failed', e);
                }
            }
            res.json({
                queues: {
                    bullmq: {
                        default: defaultCounts,
                        campaign: campaignCounts,
                        email: emailCounts
                    },
                    rabbitmq: rabbitStats
                },
                status: 'healthy'
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getActivityFeed = async (req, res) => {
        try {
            const [newUsers, recentContacts] = await Promise.all([
                User.find({ userType: 'user' }).sort({ createdAt: -1 }).limit(10).select('name email createdAt'),
                Contact.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(10).select('name status createdAt userId').populate('userId', 'name email')
            ]);
            const activities = [
                ...newUsers.map(u => ({ type: 'USER_REGISTRATION', data: u, timestamp: u.createdAt })),
                ...recentContacts.map(c => ({ type: 'CARD_UPLOAD', data: c, timestamp: c.createdAt }))
            ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
            res.json(activities);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getTopUsers = async (req, res) => {
        try {
            const topUsers = await Contact.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$userId', scanCount: { $sum: 1 } } },
                { $sort: { scanCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $project: {
                        _id: 1,
                        scanCount: 1,
                        email: '$userDetails.email',
                        name: '$userDetails.name',
                        plan: '$userDetails.plan',
                        subscriptionType: '$userDetails.subscriptionType'
                    }
                }
            ]);
            res.json(topUsers);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
