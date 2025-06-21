
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AuthFeaturesSection = () => {
  return (
    <div className="mt-12 text-center">
      <Card className="bg-gradient-to-r from-orange-500/20 to-purple-900/20 border-orange-500/30 backdrop-blur-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            🚀 Beta Access Features
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-200">
            <div>
              <span className="font-semibold text-orange-400">✓ Real-Time Data:</span> Live odds from all major tracks
            </div>
            <div>
              <span className="font-semibold text-orange-400">✓ AI-Powered:</span> Quantum computing analytics
            </div>
            <div>
              <span className="font-semibold text-orange-400">✓ Professional Tools:</span> Used by successful handicappers
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthFeaturesSection;
