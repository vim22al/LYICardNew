import { User } from '../models/user.model.js';
export class AdminUserController {
    /**
     * List all users with filtering, sorting, search, and pagination
     */
    listUsers = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order === 'asc' ? 1 : -1;
            const plan = req.query.plan || '';
            const status = req.query.status || '';
            const query = { userType: 'user' };
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            if (plan) {
                query.subscriptionType = plan;
            }
            if (status) {
                query.subscriptionStatus = status;
            }
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                User.find(query)
                    .sort({ [sortBy]: order })
                    .skip(skip)
                    .limit(limit)
                    .select('-password'),
                User.countDocuments(query),
            ]);
            res.json({
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get a single user by ID
     */
    getUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Update a user's details
     */
    updateUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const updates = req.body;
            // Prevent sensitive fields from being updated directly if needed
            // For now, allow admin to update most fields
            const allowedUpdates = [
                'name',
                'email',
                'subscriptionStatus',
                'subscriptionType',
                'subscriptionStartDate',
                'subscriptionEndDate',
                'plan',
                'userType'
            ];
            const filteredUpdates = {};
            Object.keys(updates).forEach((key) => {
                if (allowedUpdates.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });
            const user = await User.findByIdAndUpdate(userId, { $set: filteredUpdates }, { new: true, runValidators: true }).select('-password');
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
