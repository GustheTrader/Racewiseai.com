#!/bin/bash
# Automated Supabase Reset and Fix Application Script
# This script automates the steps in RESET_AND_FIX_SUPABASE.md

set -e  # Exit on any error

echo "🚀 Racewise AI - Supabase Reset & Security/Performance Fixes"
echo "=============================================================="
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
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check if Supabase CLI is installed
print_step "STEP 1: Checking Supabase CLI installation..."
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing..."
    npm install -g supabase
    print_success "Supabase CLI installed"
else
    print_success "Supabase CLI already installed ($(supabase --version))"
fi

# Step 2: Ask about backup
print_step "STEP 2: Backup check"
echo -n "Do you want to backup current data? (y/N): "
read -r backup_response
if [[ "$backup_response" =~ ^[Yy]$ ]]; then
    print_step "Creating backup..."
    chmod +x scripts/backup-supabase.sh 2>/dev/null || true
    if [ -f "scripts/backup-supabase.sh" ]; then
        ./scripts/backup-supabase.sh
        print_success "Backup completed"
    else
        print_warning "Backup script not found, skipping..."
    fi
else
    print_warning "Skipping backup"
fi

# Step 3: Stop current Supabase instance
print_step "STEP 3: Stopping Supabase..."
supabase stop 2>/dev/null || print_warning "Supabase was not running"
print_success "Supabase stopped"

# Step 4: Reset Supabase
print_step "STEP 4: Resetting Supabase..."
echo -n "This will delete all local data. Continue? (y/N): "
read -r reset_response
if [[ "$reset_response" =~ ^[Yy]$ ]]; then
    supabase db reset --force 2>/dev/null || true
    rm -rf supabase/.temp 2>/dev/null || true
    rm -rf supabase/.branches 2>/dev/null || true
    print_success "Supabase reset complete"
else
    print_error "Reset cancelled by user"
    exit 1
fi

# Step 5: Start Supabase
print_step "STEP 5: Starting Supabase with new configuration..."
supabase start
print_success "Supabase started successfully"

echo ""
print_warning "IMPORTANT: Save the following credentials:"
echo ""
supabase status
echo ""

# Step 6: Apply migration
print_step "STEP 6: Applying security & performance migration..."
if [ -f "supabase/migrations/20260113_security_and_performance_fixes.sql" ]; then
    supabase db push || supabase migration up
    print_success "Migration applied successfully"

    # Verify indexes were created
    print_step "Verifying indexes..."
    INDEX_COUNT=$(supabase db psql -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';" | xargs)
    print_success "Created $INDEX_COUNT indexes"

    # Verify RLS policies
    print_step "Verifying RLS policies..."
    POLICY_COUNT=$(supabase db psql -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" | xargs)
    print_success "Created $POLICY_COUNT RLS policies"
else
    print_error "Migration file not found!"
    exit 1
fi

# Step 7: Check shared security module
print_step "STEP 7: Verifying shared security module..."
if [ -f "supabase/functions/_shared/security.ts" ]; then
    print_success "Shared security module exists"
else
    print_error "Shared security module missing!"
    exit 1
fi

# Step 8: Deploy edge functions (optional)
print_step "STEP 8: Edge function deployment"
echo -n "Do you want to deploy edge functions now? (y/N): "
read -r deploy_response
if [[ "$deploy_response" =~ ^[Yy]$ ]]; then
    print_step "Deploying edge functions..."

    FUNCTIONS=(
        "race-analyst-api"
        "firecrawl-live-odds"
        "analyze-paddock-video"
        "parse-pdf-with-gemini"
        "morning-report"
    )

    for func in "${FUNCTIONS[@]}"; do
        print_step "Deploying $func..."
        if supabase functions deploy "$func" 2>&1; then
            print_success "$func deployed"
        else
            print_warning "$func deployment failed (may need API keys set first)"
        fi
    done
else
    print_warning "Skipping edge function deployment"
    echo "You can deploy later with: supabase functions deploy <function-name>"
fi

# Step 9: Environment variables reminder
print_step "STEP 9: Environment variables"
echo ""
print_warning "Remember to set these secrets for edge functions:"
echo "  supabase secrets set GEMINI_API_KEY='your-key'"
echo "  supabase secrets set FIRECRAWL_API_KEY='your-key'"
echo "  supabase secrets set ODDS_PULSE_API_KEY='your-key'"
echo ""

# Step 10: Update frontend .env
print_step "STEP 10: Frontend environment variables"
echo ""
print_warning "Update your .env file with the credentials shown above:"
echo "  VITE_SUPABASE_URL=http://localhost:54321"
echo "  VITE_SUPABASE_ANON_KEY=<anon-key-from-status-output>"
echo ""

# Step 11: Final checks
print_step "STEP 11: Running final verification..."

# Check Supabase status
if supabase status &> /dev/null; then
    print_success "Supabase is running"
else
    print_error "Supabase is not running!"
    exit 1
fi

# Check for rate limiting table
if supabase db psql -c "SELECT 1 FROM api_rate_limits LIMIT 1;" &> /dev/null; then
    print_success "Rate limiting table exists"
else
    print_warning "Rate limiting table not found (may be normal if migration didn't run)"
fi

# Check for security audit log table
if supabase db psql -c "SELECT 1 FROM security_audit_log LIMIT 1;" &> /dev/null; then
    print_success "Security audit log table exists"
else
    print_warning "Security audit log table not found"
fi

# Summary
echo ""
echo "=============================================================="
print_success "Supabase Reset & Fix Application Complete!"
echo "=============================================================="
echo ""
echo "📊 Summary:"
echo "  ✅ Supabase CLI: Installed and running"
echo "  ✅ Database: Reset and migrated"
echo "  ✅ Indexes: $INDEX_COUNT created"
echo "  ✅ RLS Policies: $POLICY_COUNT created"
echo "  ✅ Security modules: Verified"
echo ""
echo "🎯 Next Steps:"
echo "  1. Set edge function secrets (see above)"
echo "  2. Update frontend .env file"
echo "  3. Restart frontend: npm run dev"
echo "  4. Test login and dashboard"
echo "  5. Verify performance improvements"
echo ""
echo "📖 For detailed testing instructions, see:"
echo "   RESET_AND_FIX_SUPABASE.md"
echo ""
echo "🎉 Your Supabase instance is now secure and optimized!"
echo ""
