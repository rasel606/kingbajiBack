#!/bin/bash
# Backend Deployment Diagnostics

echo "🔍 BACKEND DEPLOYMENT DIAGNOSTICS"
echo "=================================="
echo ""

echo "📍 Current Directory:"
pwd

echo ""
echo "📦 Git Status:"
git status --short

echo ""
echo "🌐 Testing Render Backend:"
echo "URL: https://kingbaji-backend.onrender.com"
curl -i https://kingbaji-backend.onrender.com/ 2>&1 | head -20

echo ""
echo "🌐 Testing Vercel Backend:"
echo "URL: https://kingbaji-back-xvdy.vercel.app"
curl -i https://kingbaji-back-xvdy.vercel.app/ 2>&1 | head -20

echo ""
echo "📋 Checking Backend Files:"
echo "- app.js exists: $([ -f app.js ] && echo '✅' || echo '❌')"
echo "- index.js exists: $([ -f index.js ] && echo '✅' || echo '❌')"
echo "- package.json exists: $([ -f package.json ] && echo '✅' || echo '❌')"
echo "- vercel.json exists: $([ -f vercel.json ] && echo '✅' || echo '❌')"
echo "- render.yaml exists: $([ -f render.yaml ] && echo '✅' || echo '❌')"
echo "- Procfile exists: $([ -f Procfile ] && echo '✅' || echo '❌')"

echo ""
echo "🔧 Environment Check:"
node --version
npm --version

echo ""
echo "📚 Dependencies Installed:"
npm list --depth=0 2>&1 | head -20
