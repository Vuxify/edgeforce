#!/bin/bash
# EdgeForce Quick Deploy Script

set -e

echo "🚀 EdgeForce Deployment Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd apps/web && npm install && cd ../..
cd bot && npm install && cd ..

echo "✅ Dependencies installed"
echo ""

# Create .env files if they don't exist
if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating .env.local from example..."
    cp apps/web/.env.example apps/web/.env.local
    echo "⚠️  Please edit apps/web/.env.local with your credentials"
fi

if [ ! -f "bot/.env" ]; then
    echo "📝 Creating bot/.env from example..."
    cp bot/.env.example bot/.env
    echo "⚠️  Please edit bot/.env with your Discord credentials"
fi

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit apps/web/.env.local (Supabase, Stripe, Admin password)"
echo "   - Edit bot/.env (Discord bot token)"
echo ""
echo "2. Set up Supabase:"
echo "   - Follow DATABASE_SETUP.md to create schema"
echo ""
echo "3. Configure Stripe:"
echo "   - Follow STRIPE_SETUP.md to create products"
echo ""
echo "4. Deploy to Vercel:"
echo "   - Connect GitHub repo to Vercel"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "5. Start development:"
echo "   cd apps/web && npm run dev"
echo "   cd bot && node index.js"
echo ""
echo "📚 Full guide: DEPLOYMENT.md"
echo ""
echo "✨ Setup complete!"
