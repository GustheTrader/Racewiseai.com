import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Target, Brain, Sparkles } from 'lucide-react';
import TwinSpiresModelTab from '@/components/admin/TwinSpiresModelTab';
import TrdModelUploadTab from '@/components/admin/TrdModelUploadTab';
import ModelTrainingTab from '@/components/admin/ModelTrainingTab';

const AdminModelsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('twinspires');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Models & Training
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage prediction models, upload race data, and train AI systems
          </p>
        </div>
      </div>

      {/* Main Tabs - Clean separation between model types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-auto">
          <TabsTrigger 
            value="twinspires" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20"
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <div className="text-left">
              <div className="font-medium">TwinSpires</div>
              <div className="text-xs text-muted-foreground hidden sm:block">PDF Parsing & Ensemble</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="trd" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20"
          >
            <Target className="h-4 w-4 text-blue-400" />
            <div className="text-left">
              <div className="font-medium">TRD Consensus</div>
              <div className="text-xs text-muted-foreground hidden sm:block">Rankings Upload</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="training" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20"
          >
            <Brain className="h-4 w-4 text-purple-400" />
            <div className="text-left">
              <div className="font-medium">AI Training</div>
              <div className="text-xs text-muted-foreground hidden sm:block">Build Custom Models</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="twinspires" className="mt-0">
          <TwinSpiresModelTab />
        </TabsContent>

        <TabsContent value="trd" className="mt-0">
          <TrdModelUploadTab />
        </TabsContent>

        <TabsContent value="training" className="mt-0">
          <ModelTrainingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModelsPage;
