// Quick script to create admin account directly in MongoDB
// Run this if the API endpoints aren't working

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Admin Schema (simplified)
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isLocked: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/z2b');
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('\nIf you forgot the password, delete this admin and run the script again.');
      process.exit(0);
    }

    // Hash password
    const defaultPassword = 'Z2BAdmin2024!';
    console.log('\nCreating admin with default password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@z2b.co.za',
      password: hashedPassword,
      role: 'superadmin'
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Password: Z2BAdmin2024!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
