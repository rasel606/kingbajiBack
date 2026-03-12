/**
 * Seed Legal Content & FAQ Data
 * 
 * This script initializes the database with default legal content and FAQ items.
 * 
 * Usage:
 * node src/scripts/seedLegalContent.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LegalContent = require('../models/LegalContent');
const FAQ = require('../models/FAQ');

const LEGAL_CONTENT_DATA = {
  terms: {
    type: 'terms',
    title: 'Terms and Conditions',
    language: 'en',
    content: `
      <h2>1. Agreement to Terms</h2>
      <p>By accessing and using REDBAJI, you hereby agree to be bound by these Terms and Conditions. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

      <h3>1.1 Eligibility</h3>
      <p>To use our services, you must meet the following requirements:</p>
      <ul>
        <li>You must be at least 18 years of age</li>
        <li>You must be legally permitted to participate in gambling activities in your jurisdiction</li>
        <li>You must not be on any self-exclusion list</li>
        <li>You must provide accurate and complete registration information</li>
      </ul>

      <h2>2. User Responsibilities</h2>
      <p>As a user of our platform, you agree to maintain the security of your account and comply with all applicable laws.</p>

      <h2>3. Governing Law</h2>
      <p>These Terms shall be governed by and defined following the laws of the jurisdiction in which we operate.</p>
    `,
    metaDescription: 'Read our terms and conditions for REDBAJI gaming platform',
    metaKeywords: 'terms, conditions, agreement, legal'
  },
  
  privacy: {
    type: 'privacy',
    title: 'Privacy Policy',
    language: 'en',
    content: `
      <h2>1. Information We Collect</h2>
      <p>We collect information that you provide directly to us, including personal identification information, account credentials, and payment information.</p>

      <h3>1.1 Automatically Collected Information</h3>
      <p>When you use our services, we automatically collect certain information, including device information and usage data.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and comply with legal obligations.</p>

      <h2>3. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.</p>
    `,
    metaDescription: 'Our privacy policy and data protection information',
    metaKeywords: 'privacy, policy, data protection, security'
  },

  rules: {
    type: 'rules',
    title: 'Rules and Regulations',
    language: 'en',
    content: `
      <h2>1. General Rules</h2>
      <p>All games and betting activities on REDBAJI are subject to the following general rules:</p>
      <ul>
        <li>All bets are final and cannot be cancelled once confirmed</li>
        <li>Minimum and maximum bet limits apply to all games</li>
        <li>We reserve the right to void bets in case of obvious errors</li>
        <li>All winnings are subject to verification</li>
      </ul>

      <h2>2. Fairness and RNG</h2>
      <p>All our games use certified Random Number Generators (RNG) to ensure fair play. Our RNG systems are regularly tested by independent auditors.</p>

      <h2>3. Dispute Resolution</h2>
      <p>In case of disputes, players should first contact our customer support team.</p>
    `,
    metaDescription: 'Gaming rules and regulations for REDBAJI',
    metaKeywords: 'rules, regulations, gaming, betting'
  },

  'responsible-gambling': {
    type: 'responsible-gambling',
    title: 'Responsible Gambling',
    language: 'en',
    content: `
      <h2>Our Commitment to Responsible Gambling</h2>
      <p>At REDBAJI, we are committed to promoting responsible gambling and providing tools to help our players maintain control over their gaming activities.</p>

      <h2>1. Self-Assessment</h2>
      <p>Ask yourself these questions:</p>
      <ul>
        <li>Do you gamble to escape from problems or relieve feelings of anxiety or depression?</li>
        <li>Do you feel restless or irritable when trying to cut down on gambling?</li>
        <li>Have you lied to family members to conceal the extent of your gambling?</li>
      </ul>

      <h2>2. Responsible Gambling Tools</h2>
      <p>We offer deposit limits, loss limits, session time limits, and self-exclusion options to help you maintain control.</p>

      <h2>3. Getting Help</h2>
      <p>If you need help, please contact us or reach out to professional gambling support services.</p>
    `,
    metaDescription: 'Information about responsible gambling and player protection',
    metaKeywords: 'responsible gambling, addiction, help, support'
  },

  about: {
    type: 'about',
    title: 'About Us',
    language: 'en',
    content: `
      <h2>Welcome to REDBAJI</h2>
      <p>REDBAJI is a premier online gaming platform dedicated to providing an exceptional entertainment experience.</p>

      <h2>Our Mission</h2>
      <p>Our mission is to provide a safe, fair, and entertaining gaming environment where players can enjoy their favorite games with confidence.</p>

      <h2>Why Choose REDBAJI?</h2>
      <ul>
        <li><strong>Extensive Game Selection:</strong> Thousands of games from leading providers</li>
        <li><strong>Security & Licensing:</strong> State-of-the-art encryption technology</li>
        <li><strong>Fast & Secure Payments:</strong> Multiple payment methods with fast processing</li>
        <li><strong>24/7 Customer Support:</strong> Dedicated support team available round the clock</li>
      </ul>

      <h2>Our Values</h2>
      <ul>
        <li><strong>Integrity:</strong> We operate with transparency and honesty</li>
        <li><strong>Innovation:</strong> We continuously improve our platform</li>
        <li><strong>Responsibility:</strong> We promote responsible gambling</li>
      </ul>
    `,
    metaDescription: 'Learn about REDBAJI gaming platform',
    metaKeywords: 'about us, company, information'
  },

  contact: {
    type: 'contact',
    title: 'Contact Information',
    language: 'en',
    content: `
      <h2>Get in Touch</h2>
      <p>We're here to help! Whether you have a question, need support, or just want to provide feedback, our team is ready to assist you.</p>

      <h3>Business Hours</h3>
      <p><strong>Customer Support:</strong> Available 24/7</p>
      <p><strong>Email Response Time:</strong> Within 24 hours</p>
      <p><strong>Live Chat:</strong> Instant response</p>

      <h3>Contact Methods</h3>
      <ul>
        <li>Email: support@redbaji.com</li>
        <li>Phone: +880-XXX-XXXX-XXX</li>
        <li>Live Chat: Available on website</li>
        <li>Telegram: @redbajibd</li>
      </ul>
    `,
    metaDescription: 'Contact REDBAJI support team',
    metaKeywords: 'contact us, customer support, help'
  }
};

const FAQ_DATA = [
  {
    category: 'account',
    question: 'How do I create an account?',
    answer: '<p>Creating an account is easy! Click the "Sign Up" button, fill in your details, and verify your account through email or SMS.</p>',
    order: 1,
    isFeatured: true
  },
  {
    category: 'account',
    question: 'How do I verify my account?',
    answer: '<p>Go to Account Settings > Verification. You will need to provide a valid government ID, proof of address, and a selfie holding your ID.</p>',
    order: 2,
    isFeatured: true
  },
  {
    category: 'account',
    question: 'I forgot my password. What should I do?',
    answer: '<p>Click on "Forgot Password" on the login page and follow the instructions to reset your password.</p>',
    order: 3
  },
  {
    category: 'deposit',
    question: 'What payment methods do you accept?',
    answer: '<p>We accept bKash, Nagad, Rocket, Bank Transfer, Cryptocurrency, and Credit/Debit Cards.</p>',
    order: 4,
    isFeatured: true
  },
  {
    category: 'deposit',
    question: 'What is the minimum deposit amount?',
    answer: '<p>The minimum deposit amount varies: bKash/Nagad/Rocket: 200 BDT, Bank Transfer: 500 BDT, Cryptocurrency: $10, Cards: $10</p>',
    order: 5
  },
  {
    category: 'deposit',
    question: 'Are deposits instant?',
    answer: '<p>Most deposits are instant or processed within a few minutes. Bank transfers may take 1-3 business days.</p>',
    order: 6
  },
  {
    category: 'withdrawal',
    question: 'How do I withdraw my winnings?',
    answer: '<p>Go to Wallet > Withdraw, select your payment method, enter the amount, and confirm. Note: You must verify your account before withdrawing.</p>',
    order: 7
  },
  {
    category: 'withdrawal',
    question: 'How long do withdrawals take?',
    answer: '<p>Processing times: bKash/Nagad/Rocket: 5-30 minutes, Bank Transfer: 1-3 business days, Cryptocurrency: Within 1 hour, Cards: 3-5 business days</p>',
    order: 8
  },
  {
    category: 'games',
    question: 'What types of games do you offer?',
    answer: '<p>We offer Slots (5000+ games), Live Casino, Table Games, Sports Betting, Crash Games, and Fishing Games.</p>',
    order: 9
  },
  {
    category: 'games',
    question: 'Are your games fair?',
    answer: '<p>Yes! All our games use certified Random Number Generators (RNG) and are regularly audited by independent testing agencies.</p>',
    order: 10
  },
  {
    category: 'bonus',
    question: 'What welcome bonus do you offer?',
    answer: '<p>New players receive a 100% Welcome Bonus up to 10,000 BDT on their first deposit plus 100 free spins on selected slots.</p>',
    order: 11,
    isFeatured: true
  },
  {
    category: 'security',
    question: 'Is my personal information safe?',
    answer: '<p>Absolutely! We use industry-standard SSL encryption to protect all personal and financial information.</p>',
    order: 12
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');

    // Clear existing data
    console.log('🗑️ Clearing existing legal content...');
    await LegalContent.deleteMany({});
    await FAQ.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert legal content
    console.log('📝 Seeding legal content...');
    const legalContents = await LegalContent.insertMany(
      Object.values(LEGAL_CONTENT_DATA).map(content => ({
        ...content,
        isActive: true
      }))
    );
    console.log(`✅ Seeded ${legalContents.length} legal content items`);

    // Insert FAQ items
    console.log('📋 Seeding FAQ items...');
    const faqItems = await FAQ.insertMany(
      FAQ_DATA.map(item => ({
        ...item,
        language: 'en',
        isActive: true
      }))
    );
    console.log(`✅ Seeded ${faqItems.length} FAQ items`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`
      Summary:
      - Legal Content Items: ${legalContents.length}
      - FAQ Items: ${faqItems.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 MongoDB disconnected');
    process.exit(0);
  }
}

// Run seed
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
