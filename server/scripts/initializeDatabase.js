/**
 * Database Initialization Script
 * Run this script once after deployment to initialize:
 * - TLI configurations (8 levels)
 * - Commission configurations (ISP, QPB, TSC)
 *
 * Usage: node scripts/initializeDatabase.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TLIConfig from '../models/TLIConfig.js';
import CommissionConfig from '../models/CommissionConfig.js';

// Load environment variables
dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ========================================
    // INITIALIZE TLI CONFIGURATIONS
    // ========================================
    console.log('📊 Initializing TLI configurations...');

    const existingTLI = await TLIConfig.find({ isActive: true });
    if (existingTLI.length > 0) {
      console.log('⚠️  TLI configurations already exist. Skipping...\n');
    } else {
      await TLIConfig.initializeDefaults();
      console.log('✅ TLI configurations initialized with 8 levels\n');
    }

    // ========================================
    // INITIALIZE COMMISSION CONFIGURATIONS
    // ========================================
    console.log('💰 Initializing Commission configurations...');

    // ISP Configuration
    const existingISP = await CommissionConfig.findOne({ configType: 'ISP', isActive: true });
    if (!existingISP) {
      const ispConfig = new CommissionConfig({
        configType: 'ISP',
        ispRates: {
          FAM: 0.00,
          Bronze: 0.18,
          Copper: 0.22,
          Silver: 0.25,
          Gold: 0.28,
          Platinum: 0.30,
          Diamond: 0.00
        },
        effectiveDate: new Date(),
        version: 1,
        isActive: true
      });
      await ispConfig.save();
      console.log('✅ ISP configuration initialized');
    } else {
      console.log('⚠️  ISP configuration already exists');
    }

    // QPB Configuration
    const existingQPB = await CommissionConfig.findOne({ configType: 'QPB', isActive: true });
    if (!existingQPB) {
      const qpbConfig = new CommissionConfig({
        configType: 'QPB',
        qpbRates: {
          firstSet: 0.075,        // 7.5% for first 3
          additionalSets: 0.10,   // 10% for additional sets
          cycleDefinition: {
            startDay: 4,          // 4th of month
            endDay: 3             // 3rd of next month
          },
          first90DaysOnly: true
        },
        effectiveDate: new Date(),
        version: 1,
        isActive: true
      });
      await qpbConfig.save();
      console.log('✅ QPB configuration initialized');
    } else {
      console.log('⚠️  QPB configuration already exists');
    }

    // TSC Configuration
    const existingTSC = await CommissionConfig.findOne({ configType: 'TSC', isActive: true });
    if (!existingTSC) {
      const tscConfig = new CommissionConfig({
        configType: 'TSC',
        tscRates: {
          gen2: 0.10,   // 10%
          gen3: 0.05,   // 5%
          gen4: 0.03,   // 3%
          gen5: 0.02,   // 2%
          gen6: 0.01,   // 1%
          gen7: 0.01,   // 1%
          gen8: 0.01,   // 1%
          gen9: 0.01,   // 1%
          gen10: 0.01   // 1%
        },
        effectiveDate: new Date(),
        version: 1,
        isActive: true
      });
      await tscConfig.save();
      console.log('✅ TSC configuration initialized');
    } else {
      console.log('⚠️  TSC configuration already exists');
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   - TLI Levels: 8 configured');
    console.log('   - ISP Rates: Bronze 18%, Copper 22%, Silver 25%, Gold 28%, Platinum 30%');
    console.log('   - QPB Rate: 7.5% first set, 10% additional');
    console.log('   - TSC Rates: 10 generations configured');

    console.log('\n🔐 Next Step:');
    console.log('   Create your first CEO admin account in MongoDB:');
    console.log('   db.coachusers.updateOne(');
    console.log('     { email: "your-ceo-email@example.com" },');
    console.log('     { $set: {');
    console.log('       adminRole: "ceo",');
    console.log('       "adminPermissions.canRead": true,');
    console.log('       "adminPermissions.canEdit": true,');
    console.log('       "adminPermissions.canDelete": true,');
    console.log('       "adminPermissions.canManageAdmins": true,');
    console.log('       "adminPermissions.canEditCommissions": true,');
    console.log('       "adminPermissions.canCreateAwards": true,');
    console.log('       "adminPermissions.canAuthorizeFree": true,');
    console.log('       "adminPermissions.canProcessPayouts": true,');
    console.log('       "adminPermissions.canViewFinancials": true,');
    console.log('       roleAssignedDate: new Date()');
    console.log('     }}');
    console.log('   );');

    process.exit(0);

  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
