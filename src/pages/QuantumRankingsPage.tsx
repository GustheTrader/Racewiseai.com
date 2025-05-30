
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RankingsTable from '@/components/rankings/RankingsTable';
import TrackRaceSelector from '@/components/rankings/TrackRaceSelector';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuantumRankingsPage = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout
      title="RaceWiseAI ToolBox"
      subtitle="Quantum 5D AI Rankings - Advanced predictive horse racing analytics"
      extraButtons={
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
        >
          Back to Dashboard
        </Button>
      }
    >
      <div className="space-y-6">
        <TrackRaceSelector />
        <RankingsTable />
      </div>
    </DashboardLayout>
  );
};

export default QuantumRankingsPage;
