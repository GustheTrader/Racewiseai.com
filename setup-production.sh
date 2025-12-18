#!/bin/bash

# RaceWiseAI Gemini Scraper - Production Setup Script
# This script guides you through the production deployment process

set -e

echo "🚀 RaceWiseAI Gemini Scraper - Production Setup"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Check prerequisites
print_step "Step 1: Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi
print_success "Node.js found: $(node -v)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_success "npm found: $(npm -v)"

if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git first."
    exit 1
fi
print_success "Git found: $(git -v)"

echo ""

# Step 2: Install/Update Supabase CLI
print_step "Step 2: Setting up Supabase CLI..."
echo ""

if command -v supabase &> /dev/null; then
    print_success "Supabase CLI already installed: $(supabase --version)"
else
    print_warning "Installing Supabase CLI..."
    npm install -g supabase
    print_success "Supabase CLI installed"
fi

echo ""

# Step 3: Get Gemini API Key
print_step "Step 3: Gemini API Key Setup"
echo ""
echo "You need a Google Gemini API key for production."
echo ""
echo "Steps:"
echo "1. Go to: https://aistudio.google.com/app/apikey"
echo "2. Click 'Get API Key'"
echo "3. Select 'Create API Key in new project'"
echo "4. Copy the generated key"
echo ""

read -p "Do you have your Gemini API key ready? (yes/no): " gemini_ready

if [ "$gemini_ready" != "yes" ]; then
    print_error "Please get your API key from https://aistudio.google.com/app/apikey and run this script again."
    exit 1
fi

read -sp "Paste your Gemini API key: " gemini_api_key
echo ""
echo ""

if [ -z "$gemini_api_key" ]; then
    print_error "API key is empty. Exiting."
    exit 1
fi

print_success "API key received (hidden for security)"

echo ""

# Step 4: Get Supabase Project Details
print_step "Step 4: Supabase Project Configuration"
echo ""

read -p "Enter your Supabase Project ID: " supabase_project_id
read -p "Enter your Supabase Project URL (https://xxx.supabase.co): " supabase_url
read -p "Enter your Supabase Publishable Key: " supabase_key

if [ -z "$supabase_project_id" ] || [ -z "$supabase_url" ] || [ -z "$supabase_key" ]; then
    print_error "Missing Supabase configuration. Exiting."
    exit 1
fi

print_success "Supabase project configured"

echo ""

# Step 5: Update .env file
print_step "Step 5: Updating environment configuration..."
echo ""

# Backup existing .env
if [ -f ".env" ]; then
    cp .env .env.backup
    print_success "Backed up existing .env to .env.backup"
fi

# Create or update .env
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=$supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=$supabase_key
VITE_SUPABASE_URL=$supabase_url

# Admin Configuration (set these in production)
VITE_ADMIN_EMAILS=your_admin_email@example.com
VITE_DEV_EMAIL=
VITE_DEV_PASSWORD=

# Note: GEMINI_API_KEY will be set in Supabase Edge Function Secrets
# DO NOT add it here for security reasons
EOF

print_success ".env file updated"
echo ""

# Step 6: Login to Supabase
print_step "Step 6: Supabase Authentication..."
echo ""

if supabase projects list &> /dev/null; then
    print_success "Already authenticated with Supabase"
else
    print_warning "You need to authenticate with Supabase"
    echo "Running: supabase login"
    supabase login
    print_success "Supabase authentication complete"
fi

echo ""

# Step 7: Add API Key to Supabase Secrets
print_step "Step 7: Adding Gemini API key to Supabase..."
echo ""

echo "Setting GEMINI_API_KEY secret in Supabase..."
supabase secrets set GEMINI_API_KEY="$gemini_api_key" --project-id "$supabase_project_id"

print_success "Gemini API key added to Supabase secrets"

echo ""

# Step 8: Verify secrets
print_step "Step 8: Verifying secrets..."
echo ""

if supabase secrets list --project-id "$supabase_project_id" | grep -q "GEMINI_API_KEY"; then
    print_success "GEMINI_API_KEY secret verified"
else
    print_error "Failed to set GEMINI_API_KEY secret"
    exit 1
fi

echo ""

# Step 9: Deploy Edge Functions
print_step "Step 9: Deploying Edge Functions..."
echo ""

echo "Deploying scrape-with-gemini..."
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "$supabase_project_id"

print_success "scrape-with-gemini deployed"

echo ""

echo "Deploying save-scraped-data..."
supabase functions deploy save-scraped-data \
  --no-verify-jwt \
  --project-id "$supabase_project_id"

print_success "save-scraped-data deployed"

echo ""

# Step 10: Verify Functions
print_step "Step 10: Verifying deployed functions..."
echo ""

if supabase functions list --project-id "$supabase_project_id" | grep -q "scrape-with-gemini"; then
    print_success "scrape-with-gemini function verified"
else
    print_error "scrape-with-gemini function not found"
fi

if supabase functions list --project-id "$supabase_project_id" | grep -q "save-scraped-data"; then
    print_success "save-scraped-data function verified"
else
    print_error "save-scraped-data function not found"
fi

echo ""

# Step 11: Database Migration
print_step "Step 11: Database Migration"
echo ""

echo "⚠️  You need to run the database migration manually in Supabase"
echo ""
echo "Steps:"
echo "1. Go to: $supabase_url/project/_/sql/new"
echo "2. Copy contents of: supabase/migrations/20251218_create_race_scraping_schema.sql"
echo "3. Paste into SQL editor"
echo "4. Click 'Run'"
echo ""

read -p "Have you completed the database migration? (yes/no): " db_migration_done

if [ "$db_migration_done" != "yes" ]; then
    print_warning "Please complete the database migration and run this script again."
fi

echo ""

# Step 12: Install Dependencies
print_step "Step 12: Installing npm dependencies..."
echo ""

npm install
print_success "Dependencies installed"

echo ""

# Step 13: Build
print_step "Step 13: Building production bundle..."
echo ""

npm run build
print_success "Production build complete"

echo ""

# Step 14: Summary
print_step "Setup Complete! 🎉"
echo ""
echo "==============================================="
echo ""
echo "✓ Gemini API key configured"
echo "✓ Supabase secrets updated"
echo "✓ Edge functions deployed"
echo "✓ Dependencies installed"
echo "✓ Production build ready"
echo ""
echo "==============================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Complete database migration:"
echo "   - Go to: $supabase_url/project/_/sql/new"
echo "   - Run the migration SQL"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Test the scraper:"
echo "   - Navigate to: http://localhost:5173/scraper-dashboard"
echo "   - Try a test URL"
echo ""
echo "4. Deploy to production:"
echo "   npm run build && npm run preview"
echo ""
echo "5. View logs:"
echo "   supabase functions logs scrape-with-gemini"
echo ""
echo "==============================================="
echo ""
echo "📚 Documentation:"
echo "   - QUICK_START_SCRAPER.md (5-minute guide)"
echo "   - PRODUCTION_SETUP.md (detailed guide)"
echo "   - SCRAPER_SETUP.md (advanced features)"
echo ""
echo "💡 Need help? Check the documentation files or see:"
echo "   - https://supabase.com/docs"
echo "   - https://ai.google.dev"
echo ""
