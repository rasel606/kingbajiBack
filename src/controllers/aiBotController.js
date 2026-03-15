// ============================================================
// AI Error Bot Controller - অ্যাপ্লিকেশন এরর চেকার ও সমাধানকারী
// MegaBaji / PNG71 Application AI Assistant
// ============================================================

const mongoose = require('mongoose');
const axios = require('axios');
const os = require('os');
const path = require('path');

// ============================================================
// বাংলায় এরর সমাধান ডেটাবেস
// ============================================================
const errorSolutionsDB = {
  // Authentication Errors
  'TOKEN_EXPIRED': {
    problem: 'আপনার লগইন সেশন শেষ হয়ে গেছে।',
    solution: 'আবার লগইন করুন। যদি সমস্যা থাকে, ব্রাউজার cache পরিষ্কার করুন।',
    steps: [
      '১. লগআউট করুন',
      '২. ব্রাউজার রিফ্রেশ করুন (Ctrl+F5)',
      '৩. আবার লগইন করুন',
      '৪. সমস্যা থাকলে: localStorage পরিষ্কার করুন'
    ],
    severity: 'medium'
  },
  'INVALID_TOKEN': {
    problem: 'লগইন টোকেন অবৈধ।',
    solution: 'লগআউট করে আবার লগইন করুন।',
    steps: ['১. লগআউট করুন', '২. আবার লগইন করুন'],
    severity: 'high'
  },
  'NETWORK_ERROR': {
    problem: 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।',
    solution: 'ইন্টারনেট সংযোগ চেক করুন এবং একটু পরে আবার চেষ্টা করুন।',
    steps: [
      '১. ইন্টারনেট সংযোগ চেক করুন',
      '২. পেজ রিফ্রেশ করুন',
      '৩. VPN ব্যবহার করলে বন্ধ করুন',
      '৪. সমস্যা চলতে থাকলে সাপোর্টে যোগাযোগ করুন'
    ],
    severity: 'high'
  },
  'MONGODB_ERROR': {
    problem: 'ডেটাবেস সংযোগে সমস্যা।',
    solution: 'MongoDB সংযোগ পরীক্ষা করুন।',
    steps: [
      '১. MONGODB_URI চেক করুন .env ফাইলে',
      '২. MongoDB Atlas/Server চালু আছে কিনা দেখুন',
      '৩. IP whitelist চেক করুন',
      '৪. mongoose connection string ঠিক আছে কিনা দেখুন'
    ],
    severity: 'critical'
  },
  'CORS_ERROR': {
    problem: 'CORS নীতি লঙ্ঘন - ফ্রন্টেন্ড থেকে ব্যাকেন্ডে সংযোগ করতে পারছে না।',
    solution: 'ব্যাকেন্ড CORS সেটিং আপডেট করুন।',
    steps: [
      '১. backend/.env এ CORS_ORIGIN আপডেট করুন',
      '২. ফ্রন্টেন্ড URL যোগ করুন',
      '৩. সার্ভার রিস্টার্ট করুন'
    ],
    severity: 'high'
  },
  'REDIS_ERROR': {
    problem: 'Redis ক্যাশ সার্ভার সংযোগে সমস্যা।',
    solution: 'Redis সার্ভার চালু করুন।',
    steps: [
      '১. redis-server চালু আছে কিনা দেখুন',
      '২. REDIS_URL চেক করুন .env ফাইলে',
      '৩. redis-cli ping দিয়ে চেক করুন'
    ],
    severity: 'medium'
  },
  'PORT_IN_USE': {
    problem: 'পোর্ট ইতিমধ্যে ব্যবহার হচ্ছে।',
    solution: 'পোর্ট পরিবর্তন করুন বা পুরানো প্রসেস বন্ধ করুন।',
    steps: [
      '১. `netstat -ano | findstr :5000` দিয়ে প্রসেস খুঁজুন',
      '২. `taskkill /PID <PID> /F` দিয়ে বন্ধ করুন',
      '৩. বা .env এ PORT পরিবর্তন করুন'
    ],
    severity: 'high'
  },
  'API_404': {
    problem: 'API এন্ডপয়েন্ট পাওয়া যাচ্ছে না।',
    solution: 'API URL এবং রাউট সঠিক কিনা নিশ্চিত করুন।',
    steps: [
      '১. API URL চেক করুন',
      '২. ব্যাকেন্ড রাউট ফাইল চেক করুন',
      '৩. Postman দিয়ে API টেস্ট করুন'
    ],
    severity: 'medium'
  },
  'BALANCE_UPDATE_FAILED': {
    problem: 'ব্যালেন্স আপডেট ব্যর্থ হয়েছে।',
    solution: 'ট্রানজেকশন লগ চেক করুন।',
    steps: [
      '১. ট্রানজেকশন হিস্ট্রি দেখুন',
      '২. কিছুক্ষণ অপেক্ষা করুন',
      '৩. সাপোর্টে যোগাযোগ করুন'
    ],
    severity: 'high'
  },
  'GAME_LAUNCH_FAILED': {
    problem: 'গেম চালু করতে ব্যর্থ।',
    solution: 'গেম সার্ভার কানেকশন চেক করুন।',
    steps: [
      '১. ইন্টারনেট সংযোগ চেক করুন',
      '২. গেম সার্ভার API status চেক করুন',
      '৩. পেজ রিফ্রেশ করে আবার চেষ্টা করুন',
      '৪. ভিন্ন গেম চেষ্টা করুন'
    ],
    severity: 'medium'
  },
  'PAYMENT_FAILED': {
    problem: 'পেমেন্ট প্রক্রিয়া ব্যর্থ হয়েছে।',
    solution: 'পেমেন্ট গেটওয়ে ও ব্যাংক তথ্য যাচাই করুন।',
    steps: [
      '১. পেমেন্ট তথ্য সঠিক কিনা চেক করুন',
      '২. ব্যাংক একাউন্ট ভ্যালিড কিনা দেখুন',
      '৩. ট্রানজেকশন লিমিট চেক করুন',
      '৪. সাপোর্টে যোগাযোগ করুন'
    ],
    severity: 'high'
  },
  'DEFAULT': {
    problem: 'অজানা ত্রুটি।',
    solution: 'পেজ রিফ্রেশ করুন অথবা সাপোর্টে যোগাযোগ করুন।',
    steps: ['১. পেজ রিফ্রেশ করুন', '২. সাপোর্টে যোগাযোগ করুন'],
    severity: 'low'
  }
};

// ============================================================
// Bangla Chat Responses - AI বট রেসপন্স
// ============================================================
const banglaChatResponses = {
  greetings: [
    'আসসালামু আলাইকুম! আমি MegaBaji AI সহায়তাকারী। আপনাকে কিভাবে সাহায্য করতে পারি?',
    'হ্যালো! আমি আপনার অ্যাপ্লিকেশনের AI বট। কোনো সমস্যা হলে আমাকে বলুন।',
    'স্বাগতম! আমি আপনার সমস্যা সমাধান করতে এখানে আছি।'
  ],
  apiError: 'API সংযোগে সমস্যা হচ্ছে। সার্ভার চালু আছে কিনা চেক করুন।',
  loginHelp: 'লগইন করতে সমস্যা? আপনার ইউজার আইডি এবং পাসওয়ার্ড সঠিক কিনা নিশ্চিত করুন।',
  depositHelp: 'ডিপোজিট করতে: মেনু > ফান্ড > ডিপোজিট যান।',
  withdrawHelp: 'উইথড্র করতে: মেনু > ফান্ড > উইথড্র যান।',
  balanceHelp: 'ব্যালেন্স দেখতে হোম পেজে উপরে দেখুন।',
  gameHelp: 'গেম খেলতে সমস্যা? প্রথমে লগইন করুন, তারপর গেম সিলেক্ট করুন।'
};

// ============================================================
// 1. সিস্টেম স্বাস্থ্য পরীক্ষা (Health Check)
// ============================================================
const systemHealthCheck = async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      services: {}
    };

    // MongoDB চেক
    const mongoState = mongoose.connection.readyState;
    healthStatus.services.mongodb = {
      status: mongoState === 1 ? 'connected' : 'disconnected',
      bangla: mongoState === 1 ? 'সংযুক্ত ✅' : 'সংযোগ বিচ্ছিন্ন ❌',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState]
    };

    // সার্ভার তথ্য
    healthStatus.services.server = {
      status: 'running',
      bangla: 'চালু আছে ✅',
      uptime: Math.floor(process.uptime()),
      uptimeBangla: `${Math.floor(process.uptime())} সেকেন্ড ধরে চালু`,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      nodeVersion: process.version,
      platform: os.platform(),
      cpuUsage: os.loadavg()[0].toFixed(2)
    };

    // পরিবেশ চেক
    healthStatus.services.environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      jwtConfigured: !!process.env.JWT_SECRET,
      mongodbConfigured: !!process.env.MONGODB_URI,
      corsConfigured: !!process.env.CORS_ORIGIN
    };

    // Redis চেক (optional)
    healthStatus.services.redis = {
      status: 'unknown',
      bangla: 'অজানা ⚠️',
      note: 'Redis স্বাস্থ্য পরীক্ষা করা হয়নি'
    };

    // সামগ্রিক স্বাস্থ্য নির্ধারণ
    const allHealthy = mongoState === 1;
    healthStatus.status = allHealthy ? 'healthy' : 'degraded';
    healthStatus.banglaSummary = allHealthy
      ? '✅ সব সার্ভিস সঠিকভাবে চলছে'
      : '⚠️ কিছু সার্ভিসে সমস্যা আছে';

    healthStatus.recommendations = [];
    if (mongoState !== 1) {
      healthStatus.recommendations.push({
        issue: 'MongoDB সংযোগ বিচ্ছিন্ন',
        fix: 'MONGODB_URI চেক করুন এবং সার্ভার রিস্টার্ট করুন'
      });
    }

    return res.status(200).json(healthStatus);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      banglaSummary: '❌ স্বাস্থ্য পরীক্ষায় ত্রুটি হয়েছে',
      error: error.message,
      errorBangla: 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে।'
    });
  }
};

// ============================================================
// 2. API এন্ডপয়েন্ট ডায়াগনস্টিক
// ============================================================
const runDiagnostics = async (req, res) => {
  try {
    const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
    const results = {
      timestamp: new Date().toISOString(),
      banglaSummary: 'API ডায়াগনস্টিক চলছে...',
      endpoints: [],
      overallStatus: 'checking',
      criticalErrors: [],
      warnings: [],
      suggestions: []
    };

    // চেক করার জন্য এন্ডপয়েন্ট তালিকা
    const endpointsToCheck = [
      { path: '/api/health', method: 'GET', name: 'হেলথ চেক', public: true },
      { path: '/api/createUser', method: 'POST', name: 'ইউজার রেজিস্ট্রেশন', public: true },
      { path: '/api/login_user', method: 'POST', name: 'লগইন', public: true },
      { path: '/api/user_details', method: 'GET', name: 'ইউজার তথ্য', auth: true },
      { path: '/api/user/balance', method: 'GET', name: 'ব্যালেন্স', auth: true },
      { path: '/api/games', method: 'GET', name: 'গেম তালিকা', public: true },
      { path: '/api/deposit', method: 'GET', name: 'ডিপোজিট', auth: true },
    ];

    let passedCount = 0;
    let failedCount = 0;

    for (const endpoint of endpointsToCheck) {
      try {
        const startTime = Date.now();
        const response = await axios({
          method: endpoint.method,
          url: `${baseUrl}${endpoint.path}`,
          timeout: 5000,
          validateStatus: (status) => status < 500,
          headers: { 'Content-Type': 'application/json' }
        });
        const responseTime = Date.now() - startTime;

        const isOk = response.status < 400 ||
          (endpoint.auth && response.status === 401) ||
          response.status === 404;

        if (isOk) passedCount++;
        else failedCount++;

        results.endpoints.push({
          name: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: response.status,
          responseTime: `${responseTime}ms`,
          banglaStatus: response.status < 400
            ? '✅ সঠিক'
            : endpoint.auth && response.status === 401
            ? '🔐 অথ প্রয়োজন (স্বাভাবিক)'
            : '❌ সমস্যা',
          ok: isOk
        });
      } catch (err) {
        failedCount++;
        results.endpoints.push({
          name: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: 'error',
          banglaStatus: '❌ সংযোগ ব্যর্থ',
          error: err.message,
          ok: false
        });
        results.criticalErrors.push(`${endpoint.name} (${endpoint.path}) এন্ডপয়েন্টে সমস্যা`);
      }
    }

    // সামগ্রিক ফলাফল
    results.overallStatus = failedCount === 0 ? 'healthy' : failedCount < 3 ? 'degraded' : 'critical';
    results.stats = {
      total: endpointsToCheck.length,
      passed: passedCount,
      failed: failedCount,
      passRate: `${Math.round((passedCount / endpointsToCheck.length) * 100)}%`
    };

    results.banglaSummary = failedCount === 0
      ? `✅ সব ${endpointsToCheck.length}টি API সঠিকভাবে কাজ করছে`
      : `⚠️ ${endpointsToCheck.length}টির মধ্যে ${failedCount}টি API-তে সমস্যা পাওয়া গেছে`;

    // সুপারিশ
    if (failedCount > 0) {
      results.suggestions.push('সার্ভার রিস্টার্ট করুন: pm2 restart all');
      results.suggestions.push('লগ ফাইল চেক করুন: backend/error.log');
      results.suggestions.push('MongoDB সংযোগ যাচাই করুন');
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      bangla: 'ডায়াগনস্টিক চলানোয় সমস্যা হয়েছে।'
    });
  }
};

// ============================================================
// 3. এরর বিশ্লেষণ ও সমাধান (Error Analysis)
// ============================================================
const analyzeError = async (req, res) => {
  try {
    const { errorCode, errorMessage, errorStack, context } = req.body;

    if (!errorMessage && !errorCode) {
      return res.status(400).json({
        error: 'এরর তথ্য প্রয়োজন',
        bangla: 'errorCode বা errorMessage দিন।'
      });
    }

    // এরর ম্যাচিং
    let matchedError = null;
    const upperMsg = (errorMessage || '').toUpperCase();
    const upperCode = (errorCode || '').toUpperCase();

    if (upperMsg.includes('TOKEN') || upperCode.includes('TOKEN')) {
      matchedError = upperMsg.includes('EXPIRED')
        ? errorSolutionsDB['TOKEN_EXPIRED']
        : errorSolutionsDB['INVALID_TOKEN'];
    } else if (upperMsg.includes('NETWORK') || upperMsg.includes('FETCH') || upperMsg.includes('ECONNREFUSED')) {
      matchedError = errorSolutionsDB['NETWORK_ERROR'];
    } else if (upperMsg.includes('MONGO') || upperMsg.includes('MONGOOSE')) {
      matchedError = errorSolutionsDB['MONGODB_ERROR'];
    } else if (upperMsg.includes('CORS')) {
      matchedError = errorSolutionsDB['CORS_ERROR'];
    } else if (upperMsg.includes('REDIS')) {
      matchedError = errorSolutionsDB['REDIS_ERROR'];
    } else if (upperMsg.includes('EADDRINUSE') || upperMsg.includes('PORT')) {
      matchedError = errorSolutionsDB['PORT_IN_USE'];
    } else if (upperMsg.includes('404') || upperCode.includes('404')) {
      matchedError = errorSolutionsDB['API_404'];
    } else if (upperMsg.includes('BALANCE') || upperCode.includes('BALANCE')) {
      matchedError = errorSolutionsDB['BALANCE_UPDATE_FAILED'];
    } else if (upperMsg.includes('GAME') || upperCode.includes('GAME')) {
      matchedError = errorSolutionsDB['GAME_LAUNCH_FAILED'];
    } else if (upperMsg.includes('PAYMENT') || upperMsg.includes('TRANSACTION')) {
      matchedError = errorSolutionsDB['PAYMENT_FAILED'];
    } else {
      matchedError = errorSolutionsDB['DEFAULT'];
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      received: { errorCode, errorMessage, context },
      analysis: {
        severity: matchedError.severity,
        bangla: {
          সমস্যা: matchedError.problem,
          সমাধান: matchedError.solution,
          পদক্ষেপ: matchedError.steps
        }
      },
      autoFixAvailable: ['CORS_ERROR', 'PORT_IN_USE'].includes(errorCode),
      supportLink: 'https://t.me/megabajisupport'
    };

    // লগ করি
    console.log(`[AI-BOT] Error analyzed: ${errorCode || errorMessage} | Severity: ${matchedError.severity}`);

    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      bangla: 'এরর বিশ্লেষণে সমস্যা হয়েছে।'
    });
  }
};

// ============================================================
// 4. AI Chat রেসপন্স (Bangla)
// ============================================================
const chatWithBot = async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'বার্তা প্রয়োজন',
        bangla: 'message ফিল্ড পূরণ করুন।'
      });
    }

    const lowerMsg = message.toLowerCase();
    let response = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      botResponse: '',
      suggestions: [],
      quickActions: []
    };

    // কীওয়ার্ড ভিত্তিক রেসপন্স
    if (lowerMsg.includes('হ্যালো') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('আস্সালামু')) {
      const greetings = banglaChatResponses.greetings;
      response.botResponse = greetings[Math.floor(Math.random() * greetings.length)];
      response.suggestions = ['API সমস্যা', 'লগইন সমস্যা', 'ডিপোজিট সমস্যা', 'গেম সমস্যা'];
    }
    else if (lowerMsg.includes('login') || lowerMsg.includes('লগইন') || lowerMsg.includes('পাসওয়ার্ড')) {
      response.botResponse = `🔐 লগইন সমস্যা সমাধান:\n\n${errorSolutionsDB['INVALID_TOKEN'].steps.join('\n')}\n\nযদি পাসওয়ার্ড ভুলে গেছেন, "পাসওয়ার্ড রিসেট" অপশন ব্যবহার করুন।`;
      response.quickActions = [
        { label: 'লগইন পেজে যান', action: '/login' },
        { label: 'পাসওয়ার্ড রিসেট', action: '/reset-password' }
      ];
    }
    else if (lowerMsg.includes('deposit') || lowerMsg.includes('ডিপোজিট') || lowerMsg.includes('জমা')) {
      response.botResponse = `💰 ডিপোজিট সংক্রান্ত তথ্য:\n\n${banglaChatResponses.depositHelp}\n\nডিপোজিট পদ্ধতি:\n১. বিকাশ/নগদ/রকেট\n২. ব্যাংক ট্রান্সফার\n৩. ক্রিপ্টোকারেন্সি\n\nসর্বনিম্ন ডিপোজিট: ৫০০ টাকা`;
      response.quickActions = [
        { label: 'ডিপোজিট করুন', action: '/deposit' }
      ];
    }
    else if (lowerMsg.includes('withdraw') || lowerMsg.includes('উইথড্র') || lowerMsg.includes('উত্তোলন')) {
      response.botResponse = `💸 উইথড্র সম্পর্কে:\n\n${banglaChatResponses.withdrawHelp}\n\nউইথড্র নিয়ম:\n১. ন্যূনতম ৫০০ টাকা\n২. ২৪-৪৮ ঘণ্টার মধ্যে প্রক্রিয়া হবে\n৩. KYC যাচাই প্রয়োজন`;
      response.quickActions = [
        { label: 'উইথড্র করুন', action: '/withdrawal' }
      ];
    }
    else if (lowerMsg.includes('balance') || lowerMsg.includes('ব্যালেন্স') || lowerMsg.includes('টাকা')) {
      response.botResponse = `💳 ব্যালেন্স চেক করতে:\n\n${banglaChatResponses.balanceHelp}\n\nব্যালেন্স রিফ্রেশ করতে পেজ রিলোড করুন।`;
    }
    else if (lowerMsg.includes('game') || lowerMsg.includes('গেম') || lowerMsg.includes('খেলা')) {
      response.botResponse = `🎮 গেম সংক্রান্ত সাহায্য:\n\n${banglaChatResponses.gameHelp}\n\nগেম চালু না হলে:\n১. ব্রাউজার আপডেট করুন\n২. Incognito mode এ চেষ্টা করুন\n৩. VPN বন্ধ করুন`;
      response.quickActions = [
        { label: 'গেম পেজ', action: '/games' }
      ];
    }
    else if (lowerMsg.includes('api') || lowerMsg.includes('error') || lowerMsg.includes('এরর') || lowerMsg.includes('সমস্যা')) {
      response.botResponse = `🔧 API/সমস্যা ডায়াগনস্টিক:\n\nআমি এখনই আপনার অ্যাপ্লিকেশন চেক করছি...\n\n${banglaChatResponses.apiError}\n\nডায়াগনস্টিক চালাতে নিচের বোতামে ক্লিক করুন।`;
      response.quickActions = [
        { label: '🔍 ডায়াগনস্টিক চালান', action: 'DIAGNOSE' },
        { label: '📊 সিস্টেম স্বাস্থ্য', action: 'HEALTH_CHECK' }
      ];
    }
    else if (lowerMsg.includes('health') || lowerMsg.includes('স্বাস্থ্য') || lowerMsg.includes('সার্ভার')) {
      response.botResponse = `🏥 সিস্টেম স্বাস্থ্য পরীক্ষা করতে "ডায়াগনস্টিক" বোতামে ক্লিক করুন।\n\nঅথবা সরাসরি চেক করুন: /api/ai-bot/health`;
      response.quickActions = [
        { label: '📊 হেলথ চেক', action: 'HEALTH_CHECK' }
      ];
    }
    else if (lowerMsg.includes('support') || lowerMsg.includes('সাপোর্ট') || lowerMsg.includes('যোগাযোগ')) {
      response.botResponse = `📞 সাপোর্ট যোগাযোগ:\n\n• Telegram: @megabajisupport\n• Email: support@megabaji.com\n• WhatsApp: +880 1700-000000\n\nসাপোর্ট সময়: ২৪/৭`;
    }
    else if (lowerMsg.includes('কি') || lowerMsg.includes('কী') || lowerMsg.includes('কিভাবে') || lowerMsg.includes('কেন')) {
      response.botResponse = `🤖 আমি MegaBaji AI বট। আমি আপনাকে এই বিষয়গুলোতে সাহায্য করতে পারি:\n\n• লগইন/রেজিস্ট্রেশন সমস্যা\n• ডিপোজিট/উইথড্র\n• গেম সমস্যা\n• API এরর নির্ণয়\n• সিস্টেম ডায়াগনস্টিক\n\nআপনার সমস্যা বাংলায় লিখুন।`;
      response.suggestions = ['লগইন সমস্যা', 'ডিপোজিট করুন', 'উইথড্র করুন', 'গেম সমস্যা'];
    }
    else {
      response.botResponse = `🤔 আপনার প্রশ্ন বুঝতে পারিনি। আরও স্পষ্টভাবে লিখুন।\n\nউদাহরণ:\n• "লগইন করতে পারছি না"\n• "ডিপোজিট সমস্যা"\n• "API কাজ করছে না"\n• "সার্ভার ডাউন"`;
      response.suggestions = ['লগইন সমস্যা', 'ডিপোজিট', 'উইথড্র', 'গেম সমস্যা', 'সাপোর্ট'];
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      botResponse: 'দুঃখিত, সাময়িক সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।'
    });
  }
};

// ============================================================
// 5. ফ্রন্টেন্ড এরর লগ রিসিভার
// ============================================================
const receiveErrorLog = async (req, res) => {
  try {
    const { errors, userAgent, url, userId, timestamp } = req.body;

    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ error: 'errors array প্রয়োজন' });
    }

    const processedErrors = errors.map(err => ({
      message: err.message,
      type: err.type,
      url: url,
      userAgent: userAgent,
      userId: userId || 'anonymous',
      timestamp: timestamp || new Date().toISOString(),
      solution: getSolutionForError(err.message)
    }));

    // লগ সেভ করি
    console.error('[AI-BOT Frontend Error Log]:', JSON.stringify(processedErrors, null, 2));

    return res.status(200).json({
      received: true,
      processed: processedErrors.length,
      bangla: `${processedErrors.length}টি এরর রিসিভ করা হয়েছে এবং বিশ্লেষণ করা হচ্ছে।`,
      solutions: processedErrors.map(e => ({
        error: e.message,
        solution: e.solution
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================
// 6. API কানেকশন টেস্ট
// ============================================================
const testApiConnection = async (req, res) => {
  try {
    const { apiUrl, method = 'GET', headers = {}, body } = req.body;

    if (!apiUrl) {
      return res.status(400).json({ error: 'apiUrl প্রয়োজন' });
    }

    // ইন্টার্নাল নেটওয়ার্কে শুধু অনুমতি দেব (SSRF প্রতিরোধ)
    const allowedHosts = [
      'localhost', '127.0.0.1', 'api.png71.live',
      process.env.ALLOWED_TEST_HOST || ''
    ].filter(Boolean);

    const urlObj = new URL(apiUrl);
    const isAllowed = allowedHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`));

    if (!isAllowed) {
      return res.status(403).json({
        error: 'এই URL টেস্ট করার অনুমতি নেই।',
        bangla: 'শুধুমাত্র অনুমোদিত হোস্ট টেস্ট করা যাবে।',
        allowedHosts
      });
    }

    const startTime = Date.now();
    const axiosConfig = {
      method: method.toUpperCase(),
      url: apiUrl,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 10000,
      validateStatus: () => true
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      axiosConfig.data = body;
    }

    const response = await axios(axiosConfig);
    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      url: apiUrl,
      method,
      status: response.status,
      responseTime: `${responseTime}ms`,
      banglaStatus: response.status < 400 ? '✅ সফল' : '❌ ব্যর্থ',
      headers: response.headers,
      dataPreview: JSON.stringify(response.data).substring(0, 500)
    });
  } catch (error) {
    return res.status(200).json({
      url: req.body?.apiUrl,
      status: 'error',
      banglaStatus: '❌ সংযোগ ব্যর্থ',
      error: error.message,
      banglaError: 'API সংযোগ করতে পারেনি।'
    });
  }
};

// ============================================================
// Helper: এরর থেকে সমাধান খোঁজা
// ============================================================
function getSolutionForError(errorMessage) {
  if (!errorMessage) return errorSolutionsDB['DEFAULT'];
  const upperMsg = errorMessage.toUpperCase();

  if (upperMsg.includes('TOKEN')) return errorSolutionsDB['TOKEN_EXPIRED'].solution;
  if (upperMsg.includes('NETWORK') || upperMsg.includes('FETCH')) return errorSolutionsDB['NETWORK_ERROR'].solution;
  if (upperMsg.includes('MONGO')) return errorSolutionsDB['MONGODB_ERROR'].solution;
  if (upperMsg.includes('CORS')) return errorSolutionsDB['CORS_ERROR'].solution;
  if (upperMsg.includes('404')) return errorSolutionsDB['API_404'].solution;

  return errorSolutionsDB['DEFAULT'].solution;
}

module.exports = {
  systemHealthCheck,
  runDiagnostics,
  analyzeError,
  chatWithBot,
  receiveErrorLog,
  testApiConnection
};
