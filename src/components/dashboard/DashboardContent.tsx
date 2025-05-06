
import React from 'react';
import OddsTable from '../OddsTable';
import LiveStreamingOdds from '../LiveStreamingOdds';
import PoolsPanel from '../PoolsPanel';
import PaceAnalysis from '../PaceAnalysis';
import SharpMovement from '../SharpMovement';
import SharpBettorTimeline from '../SharpBettorTimeline';
import TrainingFigures from '../TrainingFigures';
import StatusBar from '../StatusBar';
import TrackProfile from '../TrackProfile';
import HorseComments from '../HorseComments';
import RaceNavBar from '../RaceNavBar';
import LivePaddockComments from '../LivePaddockComments';
import AIThorianValue from '../AIThorianValue';
import EmptyStatePrompt from './EmptyStatePrompt';

interface DashboardContentProps {
  data: any;
  currentTrack: string;
  currentRace: number;
  lastUpdated: string;
  nextUpdateIn: number;
  showUpdateNotification: boolean;
  isLoading: boolean;
  onRefreshData: () => void;
  onTrackChange: (track: string) => void;
  onRaceChange: (race: number) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  data,
  currentTrack,
  currentRace,
  lastUpdated,
  nextUpdateIn,
  showUpdateNotification,
  isLoading,
  onRefreshData,
  onTrackChange,
  onRaceChange
}) => {
  if (!currentTrack || currentRace === 0) {
    return <EmptyStatePrompt />;
  }

  return (
    <>
      <RaceNavBar 
        currentTrack={currentTrack}
        currentRace={currentRace}
        mtp={21}
        allowanceInfo={{
          purse: "$127K",
          age: "3YO+",
          distance: "6F",
          surface: "Fast"
        }}
        onTrackChange={onTrackChange}
        onRaceChange={onRaceChange}
      />
      
      <div className="mb-4">
        <StatusBar 
          lastUpdated={lastUpdated} 
          onRefresh={onRefreshData}
          nextUpdateIn={nextUpdateIn}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <OddsTable 
          horses={data.horses} 
          highlightUpdates={showUpdateNotification} 
          isLoading={isLoading}
        />
      </div>
      
      {/* Sharp Bettor Timeline with Sharp Movement on the right */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="col-span-4">
          <SharpBettorTimeline bettingData={data.bettingTimeline} />
        </div>
        <div className="col-span-1">
          <SharpMovement movements={data.sharpMovements} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LiveStreamingOdds horses={data.horses} />
        <PoolsPanel poolData={data.poolData} exoticPools={data.exoticPools} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TrackProfile 
          statistics={data.trackProfile.statistics} 
          postPositions={data.trackProfile.postPositions}
          timings={data.trackProfile.timings}
        />
        <HorseComments comments={data.horseComments} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PaceAnalysis paceData={data.paceData} />
        <TrainingFigures figures={data.trainingFigures} />
      </div>
      
      {/* Live Paddock Comments and AI-Thorian Value at the bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LivePaddockComments comments={data.paddockComments} />
        <AIThorianValue valuePicks={data.valuePicks} pick3Combos={data.pick3Combos} />
      </div>
    </>
  );
};

export default DashboardContent;
