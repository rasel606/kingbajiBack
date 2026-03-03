#!/usr/bin/env node
/**
 * Vercel CI/CD Setup Script
 * Handles all git operations for deployment setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

async function setupVercel() {
  log('cyan', '\n========================================');
  log('cyan', 'Vercel CI/CD Complete Setup');
  log('cyan', '========================================\n');

  const projectRoot = 'e:\\megabaji-2';
  process.chdir(projectRoot);

  try {
    // Step 1: Configure Git
    log('yellow', 'Step [1/5]: Configuring Git...');
    try {
      const userName = exec('git config --global user.name').trim();
      if (!userName) throw new Error('No user name');
    } catch {
      log('yellow', '  Setting global git user...');
      exec('git config --global user.email "developer@megabaji.com"');
      exec('git config --global user.name "Megabaji Developer"');
    }
    log('green', '  ✓ Git configured');

    // Step 2: Stage files
    log('yellow', 'Step [2/5]: Adding files to git...');
    const files = [
      '.gitignore',
      '.github\\workflows\\deploy.yml',
      'backend\\vercel.json',
      'my-app\\vercel.json',
      'coreui-free-react-admin-template-main\\vercel.json',
      'VERCEL_DEPLOYMENT_GUIDE.md',
      'backend\\.env.example',
      'my-app\\.env.example',
      'coreui-free-react-admin-template-main\\.env.example',
      'setup-vercel.bat',
      'setup-vercel.ps1',
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        try {
          exec(`git add "${file}"`);
          log('green', `  ✓ Added: ${file}`);
        } catch (e) {
          log('yellow', `  ⚠ Could not add: ${file}`);
        }
      }
    }

    // Step 3: Check status
    log('yellow', 'Step [3/5]: Checking git status...');
    const status = exec('git status --short');
    if (status) {
      log('cyan', '\nFiles staged for commit:');
      console.log(status);
    }

    // Step 4: Commit
    log('yellow', 'Step [4/5]: Committing changes...');
    try {
      const commitMsg = 'feat: add Vercel deployment and GitHub Actions CI/CD pipeline';
      exec(`git commit -m "${commitMsg}"`);
      log('green', '  ✓ Committed successfully');
    } catch (e) {
      log('yellow', '  ⚠ Commit may have been skipped (no changes or already committed)');
    }

    // Step 5: Push
    log('yellow', 'Step [5/5]: Pushing to GitHub...');
    try {
      exec('git push origin main');
      log('green', '  ✓ Pushed to main branch');
    } catch (e) {
      if (e.message.includes('Authentication')) {
        log('yellow', '  ⚠ Push requires authentication. Push manually with: git push origin main');
      } else {
        log('yellow', `  ⚠ Push output: ${e.message.substring(0, 100)}`);
      }
    }

    // Success Summary
    log('green', '\n========================================');
    log('green', '✓ Setup Complete!');
    log('green', '========================================\n');

    log('cyan', '📋 NEXT STEPS:\n');
    log('cyan', '1️⃣  Get Vercel Access Tokens:');
    console.log('   • Visit: https://vercel.com/account/tokens');
    console.log('   • Click "Create" and copy the token\n');

    log('cyan', '2️⃣  Get Your Organization ID:');
    console.log('   • Visit: https://vercel.com/dashboard');
    console.log('   • Go to Settings > General');
    console.log('   • Copy your Org/Team ID\n');

    log('cyan', '3️⃣  Deploy Services to Vercel:');
    console.log('   cd backend && vercel deploy --prod');
    console.log('   cd ../my-app && vercel deploy --prod');
    console.log('   cd ../coreui-free-react-admin-template-main && vercel deploy --prod\n');

    log('cyan', '4️⃣  Add GitHub Secrets:');
    console.log('   • GitHub > Your Repo > Settings > Secrets > Actions');
    console.log('   • VERCEL_TOKEN (from step 1)');
    console.log('   • VERCEL_ORG_ID (from step 2)');
    console.log('   • VERCEL_PROJECT_ID_BACKEND');
    console.log('   • VERCEL_PROJECT_ID_MYAPP');
    console.log('   • VERCEL_PROJECT_ID_COREUI\n');

    log('cyan', '5️⃣  Configure Environment Variables in Vercel:');
    console.log('   Backend: MONGODB_URI, JWT_SECRET, API_KEY, NODE_ENV');
    console.log('   Frontend: REACT_APP_API_URL or VITE_API_URL\n');

    log('cyan', '6️⃣  Automatic Deployments Ready!');
    console.log('   • Push to main = Production Deploy');
    console.log('   • Push to develop = Staging Deploy');
    console.log('   • PR = Preview Deployment\n');

    log('magenta', '📖 Full Guide: See VERCEL_DEPLOYMENT_GUIDE.md\n');
  } catch (error) {
    log('red', `\n❌ Setup failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Run setup
setupVercel().then(() => {
  process.exit(0);
});
