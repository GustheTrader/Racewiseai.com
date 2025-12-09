
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Users, Award, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const ModelProcessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout 
      title="MODEL PROCESS & COMMUNITY"
      subtitle="Our handicapping edge and vision for the racing community"
      extraButtons={
        <Button
          onClick={() => navigate('/')}
          className="bg-betting-navyBlue hover:bg-betting-mediumBlue text-white font-medium"
        >
          <LineChart className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      {/* About Us Section */}
      <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard mb-6">
        <CardHeader className="bg-purple-header">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Users className="mr-2 h-5 w-5" />
            About Us
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-orange-500">Our Mission</h3>
          <p className="mb-6">
            Welcome to 5D Collective, where cutting-edge technology meets traditional handicapping wisdom.
            Our team of dedicated horseplayers and data scientists has developed a revolutionary approach to 
            horse race handicapping that brings unprecedented value and insight to the racing community.
          </p>
          
          <h3 className="text-xl font-bold mb-4 text-orange-500">Our Vision</h3>
          <p>
            We envision a thriving horse racing community where both seasoned horseplayers and newcomers 
            can access powerful analytical tools that level the playing field. By combining advanced 
            statistical modeling with deep racing knowledge, we aim to build a platform that serves 
            horsemen and women of all experience levels while respecting the rich traditions of the sport.
          </p>
        </CardContent>
      </Card>

      {/* The Model Section */}
      <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard mb-6">
        <CardHeader className="bg-purple-header">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Our Quantum 5D Model
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-orange-500">The Handicapping Edge</h3>
          <p className="mb-6">
            The Quantum 5D Model represents a revolutionary approach to race handicapping. By analyzing over 
            500 data points per horse across five dimensions of performance, our algorithm identifies value 
            opportunities that traditional handicapping often misses. These dimensions include:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><span className="font-bold text-betting-skyBlue">Speed Metrics</span> - Beyond basic speed figures, we analyze pace scenarios and sectional times</li>
            <li><span className="font-bold text-betting-skyBlue">Form Cycle</span> - Sophisticated pattern recognition for identifying horses on improving form</li>
            <li><span className="font-bold text-betting-skyBlue">Class Assessment</span> - Proprietary class ratings that account for race quality and competition</li>
            <li><span className="font-bold text-betting-skyBlue">Connections</span> - Analysis of trainer-jockey combinations and their patterns</li>
            <li><span className="font-bold text-betting-skyBlue">Track Bias</span> - Daily updates on how track conditions are affecting race outcomes</li>
          </ul>

          <h3 className="text-xl font-bold mb-4 text-orange-500">Value-Based Approach</h3>
          <p>
            Our model doesn't just pick winners—it identifies value. By comparing our proprietary odds 
            calculations with the morning line and real-time odds, we highlight opportunities where the 
            public may be undervaluing a horse's true chances, giving our users a significant edge.
          </p>
        </CardContent>
      </Card>

      {/* Articles/Blog Section */}
      <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard">
        <CardHeader className="bg-purple-header">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Featured Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Article 1 */}
            <Card className="bg-betting-navyBlue border border-betting-mediumBlue hover:border-betting-skyBlue transition-all cursor-pointer">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2 text-orange-500">The Science Behind Our Quantum Model</h3>
                <p className="text-sm text-gray-300 mb-3">May 1, 2023 • 8 min read</p>
                <p className="text-gray-200">
                  Dive deep into how our proprietary algorithms transform raw racing data into powerful 
                  predictive insights, and how our multi-dimensional approach sets us apart from traditional handicapping.
                </p>
              </CardContent>
            </Card>
            
            {/* Article 2 */}
            <Card className="bg-betting-navyBlue border border-betting-mediumBlue hover:border-betting-skyBlue transition-all cursor-pointer">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2 text-orange-500">Finding Value in Maiden Races</h3>
                <p className="text-sm text-gray-300 mb-3">June 12, 2023 • 6 min read</p>
                <p className="text-gray-200">
                  Maiden races offer some of the best value opportunities for smart handicappers. Learn how our 
                  model identifies promising first-time starters and improving runners.
                </p>
              </CardContent>
            </Card>
            
            {/* Article 3 */}
            <Card className="bg-betting-navyBlue border border-betting-mediumBlue hover:border-betting-skyBlue transition-all cursor-pointer">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2 text-orange-500">Track Bias: The Hidden Factor</h3>
                <p className="text-sm text-gray-300 mb-3">July 3, 2023 • 7 min read</p>
                <p className="text-gray-200">
                  How daily track conditions can dramatically alter race outcomes, and how our real-time 
                  track bias monitoring gives you an edge over the public.
                </p>
              </CardContent>
            </Card>
            
            {/* Article 4 */}
            <Card className="bg-betting-navyBlue border border-betting-mediumBlue hover:border-betting-skyBlue transition-all cursor-pointer">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-2 text-orange-500">Building a Better Racing Community</h3>
                <p className="text-sm text-gray-300 mb-3">August 15, 2023 • 5 min read</p>
                <p className="text-gray-200">
                  Our vision for how data-driven tools can help bring new enthusiasts to horse racing while 
                  enhancing the experience for longtime horseplayers.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ModelProcessPage;
