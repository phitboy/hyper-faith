#!/bin/bash

# Deploy Supabase Edge Functions for Omamori NFT Renderer
# This script deploys the SVG rendering functions to Supabase

echo "🚀 DEPLOYING OMAMORI RENDERER TO SUPABASE"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "   supabase login"
    exit 1
fi

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."

echo "  🎨 Deploying render function..."
supabase functions deploy render --project-ref $SUPABASE_PROJECT_REF

echo "  📋 Deploying metadata function..."
supabase functions deploy metadata --project-ref $SUPABASE_PROJECT_REF

echo "  🏥 Deploying health function..."
supabase functions deploy health --project-ref $SUPABASE_PROJECT_REF

# Set environment variables (you'll need to do this manually in Supabase dashboard)
echo ""
echo "⚙️  NEXT STEPS:"
echo "==============="
echo ""
echo "1. Go to your Supabase dashboard: https://app.supabase.com/project/$SUPABASE_PROJECT_REF/functions"
echo ""
echo "2. Set the following environment variables for your functions:"
echo "   - RPC_URL: https://rpc.hyperliquid.xyz/evm"
echo "   - CONTRACT_ADDRESS: [Your deployed contract address]"
echo "   - SUPABASE_URL: https://[your-project].supabase.co"
echo ""
echo "3. Test your functions:"
echo "   - Health: https://[your-project].supabase.co/functions/v1/health"
echo "   - Render: https://[your-project].supabase.co/functions/v1/render/1"
echo "   - Metadata: https://[your-project].supabase.co/functions/v1/metadata/1"
echo ""
echo "4. Update your contract's baseTokenURI to:"
echo "   https://[your-project].supabase.co/functions/v1/render/"
echo ""
echo "✅ Deployment complete! Your Omamori renderer is now running on Supabase Edge Functions."

