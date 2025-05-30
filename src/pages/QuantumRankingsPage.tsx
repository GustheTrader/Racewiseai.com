
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TrackRaceSelector from '@/components/rankings/TrackRaceSelector';
import RankingsTable from '@/components/rankings/RankingsTable';
import { SAMPLE_RANKING_DATA } from '@/data/rankingsData';

const QuantumRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<string>("CHURCHILL DOWNS");
  const [selectedRace, setSelectedRace] = useState<number>(1);
  
  // Get available tracks and races
  const tracks = TRACK_OPTIONS.map(track => track.value);
  const races = selectedTrack ? Object.keys(SAMPLE_RANKING_DATA[selectedTrack] || {}).map(Number) : [];
  const rankings = selectedTrack && selectedRace && SAMPLE_RANKING_DATA[selectedTrack] ? 
    SAMPLE_RANKING_DATA[selectedTrack][selectedRace] || [] : [];

  const handleTrackChange = (track: string) => {
    setSelectedTrack(track);
    // Reset to the first available race when track changes
    const firstRace = Object.keys(SAMPLE_RANKING_DATA[track] || {})[0];
    setSelectedRace(firstRace ? Number(firstRace) : null);
  };

  const handleRaceChange = (race: number) => {
    setSelectedRace(race);
  };

  return (
    <DashboardLayout 
      title="QUANTUM 5D RANKINGS"
      subtitle="Top ranked horses for each race and track"
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
      <div className="grid grid-cols-1 gap-6 mb-6">
        <TrackRaceSelector 
          selectedTrack={selectedTrack}
          selectedRace={selectedRace}
          races={races}
          onTrackChange={handleTrackChange}
          onRaceChange={handleRaceChange}
        />
      </div>

      <Card className="border-4 border-betting-tertiaryPurple bg-betting-darkCard">
        <CardHeader className="bg-purple-header">
          <CardTitle className="text-lg font-semibold text-white">
            {selectedTrack} - Race {selectedRace} Top Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <RankingsTable rankings={rankings} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default QuantumRankingsPage;
