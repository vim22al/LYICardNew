import mongoose from 'mongoose';
import { User } from './src/api/models/user.model.js';
import { Transaction } from './src/api/models/transaction.model.js';
import { connectDB } from './src/infrastructure/db/index.js';
import { env } from './src/config/env.js';

const seedTransactions = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');

    const users = await User.find({ userType: 'user' });
    if (users.length === 0) {
      console.log('No users found to seed transactions for. Please run seed-admin.ts or register users first.');
      process.exit(0);
    }

    console.log(`Found ${users.length} users. Seeding transactions and updating activity...`);

    // Clear existing transactions
    await Transaction.deleteMany({});

    const plans = [
      { name: 'pro_monthly', amount: 1200, interval: 'month' },
      { name: 'max_monthly', amount: 2400, interval: 'month' }
    ];

    const transactions = [];
    const now = new Date();

    for (const user of users) {
      // Randomly assign lastActive in the last 60 days
      const lastActiveDaysAgo = Math.floor(Math.random() * 60);
      user.lastActive = new Date(Date.now() - lastActiveDaysAgo * 24 * 60 * 60 * 1000);
      
      // Some users started long ago
      const createdDaysAgo = Math.floor(Math.random() * 120) + 30;
      user.createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000);
      await user.save();

      // Create some transactions for each user (historical)
      const numTransactions = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numTransactions; i++) {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const date = new Date(Date.now() - (i * 30 + Math.floor(Math.random() * 15)) * 24 * 60 * 60 * 1000);
        
        transactions.push({
          userId: user._id,
          amount: plan.amount,
          plan: plan.name,
          interval: plan.interval,
          status: Math.random() > 0.1 ? 'success' : 'failed',
          type: 'subscription',
          createdAt: date,
          transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`
        });
      }

      // Update user subscription status based on latest transaction
      if (Math.random() > 0.3) {
        user.subscriptionStatus = 'active';
        const isMax = Math.random() > 0.5;
        user.subscriptionType = isMax ? 'max' : 'pro';
        user.plan = isMax ? 'max_monthly' : 'pro_monthly';
        await user.save();
      }
    }

    await Transaction.insertMany(transactions);
    console.log(`Successfully seeded ${transactions.length} transactions and updated user activity.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding transactions:', error);
    process.exit(1);
  }
};

seedTransactions();
