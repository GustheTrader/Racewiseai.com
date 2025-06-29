
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatpalRealtimeDashboard from '@/components/dashboard/StatpalRealtimeDashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const StatpalDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout 
      title="STATPAL LIVE DATA"
      subtitle="Real-time race data from USA and UK tracks"
      extraButtons={
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Dashboard
        </Button>
      }
    >
      <StatpalRealtimeDashboard />
    </DashboardLayout>
  );
};

export default StatpalDashboardPage;
