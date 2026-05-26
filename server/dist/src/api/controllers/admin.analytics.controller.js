import { User } from '../models/user.model.js';
import { Transaction } from '../models/transaction.model.js';
export class AdminAnalyticsController {
    getUserAnalytics = async (req, res) => {
        try {
            const now = new Date();
            const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [totalUsers, newUsersToday, newUsersLast7Days, newUsersLast30Days, dau, wau, mau, growthData, retentionData] = await Promise.all([
                User.countDocuments({ userType: 'user' }),
                User.countDocuments({ userType: 'user', createdAt: { $gte: todayStart } }),
                User.countDocuments({ userType: 'user', createdAt: { $gte: sevenDaysAgo } }),
                User.countDocuments({ userType: 'user', createdAt: { $gte: thirtyDaysAgo } }),
                User.countDocuments({ userType: 'user', lastActive: { $gte: todayStart } }),
                User.countDocuments({ userType: 'user', lastActive: { $gte: sevenDaysAgo } }),
                User.countDocuments({ userType: 'user', lastActive: { $gte: thirtyDaysAgo } }),
                User.aggregate([
                    { $match: { userType: 'user', createdAt: { $gte: thirtyDaysAgo } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),
                // Simple retention aggregation (users who were created > 30 days ago and were active in the last 7 days)
                User.aggregate([
                    {
                        $match: {
                            userType: 'user',
                            createdAt: { $lt: thirtyDaysAgo }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            retained: {
                                $sum: {
                                    $cond: [{ $gte: ["$lastActive", sevenDaysAgo] }, 1, 0]
                                }
                            }
                        }
                    }
                ])
            ]);
            const growthRate = totalUsers > 0 ? ((newUsersLast30Days / (totalUsers - newUsersLast30Days)) * 100).toFixed(2) : 0;
            const retentionRate = retentionData.length > 0 ? ((retentionData[0].retained / retentionData[0].total) * 100).toFixed(2) : 0;
            res.json({
                metrics: {
                    totalUsers,
                    newUsers: { today: newUsersToday, last7Days: newUsersLast7Days, last30Days: newUsersLast30Days },
                    activeUsers: { dau, wau, mau },
                    growthRate: `${growthRate}%`,
                    retentionRate: `${retentionRate}%`,
                    churnRate: `${(100 - parseFloat(retentionRate.toString())).toFixed(2)}%`
                },
                charts: {
                    growth: growthData,
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getRevenueAnalytics = async (req, res) => {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [revenueStats, revenueByPlan, revenueTrend, activeSubscriptions] = await Promise.all([
                Transaction.aggregate([
                    { $match: { status: 'success' } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$amount' },
                            count: { $sum: 1 }
                        }
                    }
                ]),
                Transaction.aggregate([
                    { $match: { status: 'success' } },
                    {
                        $group: {
                            _id: '$plan',
                            revenue: { $sum: '$amount' },
                            count: { $sum: 1 }
                        }
                    }
                ]),
                Transaction.aggregate([
                    { $match: { status: 'success', createdAt: { $gte: thirtyDaysAgo } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            revenue: { $sum: '$amount' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),
                User.countDocuments({ userType: 'user', subscriptionStatus: 'active', subscriptionType: 'pro' })
            ]);
            // Calculate MRR (Rough estimate based on active pro users * average pro price)
            // In a real app, this would be more precise from the Transaction model
            const totalRevenue = revenueStats[0]?.totalRevenue || 0;
            const totalUsers = await User.countDocuments({ userType: 'user' });
            const mrr = activeSubscriptions * 29; // Assuming $29/mo for Pro
            const arr = mrr * 12;
            const arpu = totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : 0;
            res.json({
                metrics: {
                    totalRevenue,
                    mrr,
                    arr,
                    arpu,
                    activeSubscriptions,
                    conversionRate: totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(2) : 0
                },
                charts: {
                    revenueByPlan,
                    revenueTrend
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
