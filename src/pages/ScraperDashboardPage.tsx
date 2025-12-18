import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import GeminiScraperPanel from '@/components/GeminiScraperPanel';
import ScrapedRacesDisplay from '@/components/ScrapedRacesDisplay';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ScraperDashboardPage: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 Gemini Scraper Dashboard
          </h1>
          <p className="text-gray-300">
            AI-powered data extraction from Off-Track Betting websites
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-betting-navyBlue border-betting-mediumBlue">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-400">Technology</div>
              <div className="text-xl font-bold text-white mt-1">
                Gemini 2.0 Flash
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Latest Google AI model for data extraction
              </div>
            </CardContent>
          </Card>

          <Card className="bg-betting-navyBlue border-betting-mediumBlue">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-400">Database</div>
              <div className="text-xl font-bold text-white mt-1">Supabase</div>
              <div className="text-xs text-gray-500 mt-2">
                Secure PostgreSQL storage
              </div>
            </CardContent>
          </Card>

          <Card className="bg-betting-navyBlue border-betting-mediumBlue">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-400">Source</div>
              <div className="text-xl font-bold text-white mt-1">
                Off-Track Betting
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Live race data extraction
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scraper Panel */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <GeminiScraperPanel />
          </div>

          {/* Races Display */}
          <div>
            <ScrapedRacesDisplay />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-900/20 border border-blue-700">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <span className="text-2xl">1️⃣</span> Paste URL
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-200 text-sm">
              Enter an Off-Track Betting race page URL into the scraper panel.
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border border-green-700">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <span className="text-2xl">2️⃣</span> Gemini Extracts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-200 text-sm">
              AI analyzes the page and extracts race, horse, and betting pool
              data with high accuracy.
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border border-purple-700">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <span className="text-2xl">3️⃣</span> Data Saved
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-200 text-sm">
              Data is automatically saved to your Supabase database and
              displayed in the races list.
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12">
          <Card className="bg-betting-navyBlue border-betting-mediumBlue">
            <CardHeader>
              <CardTitle>✨ Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="font-semibold text-white">
                        Accurate Extraction
                      </div>
                      <div className="text-sm text-gray-400">
                        AI-powered data extraction with high accuracy
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="font-semibold text-white">Fast Processing</div>
                      <div className="text-sm text-gray-400">
                        Typically completes in under 10 seconds
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xl">💾</span>
                    <div>
                      <div className="font-semibold text-white">Auto Storage</div>
                      <div className="text-sm text-gray-400">
                        Automatically saves to Supabase
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="font-semibold text-white">Rich Data</div>
                      <div className="text-sm text-gray-400">
                        Horses, jockeys, odds, pools, and more
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xl">🔒</span>
                    <div>
                      <div className="font-semibold text-white">Secure & Private</div>
                      <div className="text-sm text-gray-400">
                        Data stored securely in your database
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xl">📈</span>
                    <div>
                      <div className="font-semibold text-white">Scalable</div>
                      <div className="text-sm text-gray-400">
                        Handle multiple races simultaneously
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions Link */}
        <div className="mt-8 text-center">
          <Card className="bg-yellow-900/20 border border-yellow-700 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <p className="text-yellow-200">
                📚 For complete setup instructions, see{' '}
                <a
                  href="/SCRAPER_SETUP.md"
                  className="font-semibold underline hover:text-yellow-300"
                >
                  SCRAPER_SETUP.md
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScraperDashboardPage;
