
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthPageBackground from '@/components/auth/AuthPageBackground';
import AuthToolsGrid from '@/components/auth/AuthToolsGrid';
import AuthFeaturesSection from '@/components/auth/AuthFeaturesSection';
import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white relative overflow-hidden">
      <AuthPageBackground />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <AuthHeader />
          
          <div className="mt-6 max-w-4xl mx-auto">
            <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-900 via-betting-tertiaryPurple via-yellow-400 to-orange-500 bg-clip-text drop-shadow-lg">
              Join hundreds of professional and recreational handicappers using our advanced AI-Tools
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <AuthToolsGrid />
          
          {/* Center Column - Auth Forms with Tabs - Override the placeholder */}
          <div className="flex items-center justify-center lg:col-start-2">
            <div className="w-full max-w-md">
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-betting-darkPurple/50 border border-orange-400/30">
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white font-semibold"
                  >
                    Join Beta
                  </TabsTrigger>
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-purple-900 data-[state=active]:text-white font-semibold"
                  >
                    Login
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="signup">
                  <SignupForm />
                </TabsContent>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <AuthFeaturesSection />
      </div>
    </div>
  );
};

export default AuthPage;
