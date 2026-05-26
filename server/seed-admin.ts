import { connectDB } from './src/infrastructure/db/index.js';
import { User } from './src/api/models/user.model.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB via connectDB utility');

    const adminEmail = 'admin@cardlyi.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      userType: 'admin',
      authType: 'email',
      subscriptionStatus: 'active',
      subscriptionType: 'pro',
      plan: 'Lifetime'
    });

    console.log('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
