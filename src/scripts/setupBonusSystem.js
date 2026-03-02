const mongoose = require('mongoose');
require('dotenv').config();

const { setupBonusConfigurations } = require('../Config/bonusSetup');
const ThirdPartyProvider = require('../models/ThirdPartyProvider');

/**
 * Setup Script
 * সম্পূর্ণ bonus system এবং provider setup করে
 */

async function setupProviders() {
  try {
    console.log('🔧 Setting up Third-Party Providers...');
    
    const providers = [
      {
        providerId: 'PROVIDER_JILI_001',
        providerName: 'JILI Games',
        providerCode: 'JILI',
        apiConfig: {
          baseUrl: process.env.PROVIDER_JILI_BASE_URL || 'https://api.jili.com',
          operatorCode: process.env.PROVIDER_JILI_OPERATOR_CODE || 'YOUR_OPERATOR_CODE',
          secretKey: process.env.PROVIDER_JILI_SECRET_KEY || 'YOUR_SECRET_KEY',
          apiVersion: 'v1',
          timeout: 30000,
        },
        providerType: 'SLOT',
        isActive: true,
        isTestMode: false,
        features: {
          seamlessWallet: true,
          transferWallet: false,
          freeSpins: true,
          tournaments: false,
          jackpot: true,
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
        },
        supportedCurrencies: ['BDT', 'USD', 'EUR'],
        webhookConfig: {
          enabled: true,
          url: process.env.WEBHOOK_URL || 'https://yourdomain.com/api/webhooks/jili',
          events: ['BET', 'WIN', 'REFUND', 'BONUS'],
        },
      },
      {
        providerId: 'PROVIDER_PP_001',
        providerName: 'Pragmatic Play',
        providerCode: 'PP',
        apiConfig: {
          baseUrl: process.env.PROVIDER_PP_BASE_URL || 'https://api.pragmaticplay.com',
          operatorCode: process.env.PROVIDER_PP_OPERATOR_CODE || 'YOUR_OPERATOR_CODE',
          secretKey: process.env.PROVIDER_PP_SECRET_KEY || 'YOUR_SECRET_KEY',
          apiVersion: 'v1',
          timeout: 30000,
        },
        providerType: 'SLOT',
        isActive: true,
        isTestMode: false,
        features: {
          seamlessWallet: true,
          transferWallet: false,
          freeSpins: true,
          tournaments: true,
          jackpot: true,
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
        },
        supportedCurrencies: ['BDT', 'USD', 'EUR'],
      },
      {
        providerId: 'PROVIDER_SEXY_001',
        providerName: 'Sexy Gaming',
        providerCode: 'SEXY',
        apiConfig: {
          baseUrl: process.env.PROVIDER_SEXY_BASE_URL || 'https://api.sexygaming.com',
          operatorCode: process.env.PROVIDER_SEXY_OPERATOR_CODE || 'YOUR_OPERATOR_CODE',
          secretKey: process.env.PROVIDER_SEXY_SECRET_KEY || 'YOUR_SECRET_KEY',
          apiVersion: 'v1',
          timeout: 30000,
        },
        providerType: 'LIVE_CASINO',
        isActive: true,
        isTestMode: false,
        features: {
          seamlessWallet: true,
          transferWallet: false,
          freeSpins: false,
          tournaments: false,
          jackpot: false,
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
        },
        supportedCurrencies: ['BDT', 'USD'],
      },
    ];
    
    for (const providerData of providers) {
      const existing = await ThirdPartyProvider.findOne({ 
        providerCode: providerData.providerCode 
      });
      
      if (existing) {
        console.log(`⚠️  Provider already exists: ${providerData.providerCode}`);
        await ThirdPartyProvider.findOneAndUpdate(
          { providerCode: providerData.providerCode },
          providerData,
          { new: true }
        );
        console.log(`✅ Updated: ${providerData.providerCode}`);
      } else {
        await ThirdPartyProvider.create(providerData);
        console.log(`✅ Created: ${providerData.providerCode}`);
      }
    }
    
    console.log('✅ All Providers setup complete');
    return { success: true, count: providers.length };
    
  } catch (error) {
    console.error('❌ Setup Providers Error:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Bonus System Setup...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
    
    // Setup Providers
    const providerResult = await setupProviders();
    console.log(`\n✅ Providers Setup: ${providerResult.count} providers\n`);
    
    // Setup Bonus Configurations
    const bonusResult = await setupBonusConfigurations();
    console.log(`\n✅ Bonus Configurations Setup: ${bonusResult.count} bonuses\n`);
    
    console.log('🎉 Setup Complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Providers: ${providerResult.count}`);
    console.log(`   - Bonus Configurations: ${bonusResult.count}`);
    console.log('\n✅ Your system is ready to use!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Setup Failed:', error);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  main();
}

module.exports = { setupProviders, main };
