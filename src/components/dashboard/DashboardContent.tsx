
import React, { useState } from 'react';
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
import TicketBetGenerator from '../TicketBetGenerator';
import EmptyStatePrompt from './EmptyStatePrompt';
import PersonalModelCard from '../PersonalModelCard';
import AIAgentsCard from '../ai-agents/AIAgentsCard';
import VideoPerformanceCard from '../VideoPerformanceCard';

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
  const [ticketSelections, setTicketSelections] = useState<Set<number>>(new Set());

  if (!currentTrack || currentRace === 0) {
    return <EmptyStatePrompt />;
  }

  // Filter available horses (non-disqualified) to ensure consistency across all components
  const availableHorses = data.horses.filter((horse: any) => !horse.isDisqualified);

  return (
    <>
      <div className="mb-4">
        <StatusBar 
          lastUpdated={lastUpdated} 
          onRefresh={onRefreshData}
          nextUpdateIn={nextUpdateIn}
        />
      </div>

      {/* AI Agents Card - position 2 below header */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <AIAgentsCard />
      </div>

      {/* Race Navigation Bar - moved below AI agents */}
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

      <div className="grid grid-cols-1 gap-4 mb-4">
        <OddsTable 
          horses={data.horses} 
          highlightUpdates={showUpdateNotification} 
          isLoading={isLoading}
          selectedHorseIds={ticketSelections}
        />
      </div>

      {/* Personal Model Card - moved below AI Agents */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <PersonalModelCard horses={data.horses} />
      </div>
      
      {/* Sharp Bettor Timeline with smaller Sharp Movement card - adjusted grid to make Sharp Movement 15% wider */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-9">
          <SharpBettorTimeline 
            bettingData={data.bettingTimeline} 
            horses={availableHorses}
          />
        </div>
        <div className="col-span-3">
          <SharpMovement movements={data.sharpMovements} />
        </div>
      </div>

      {/* Ticket Bet Generator - moved below Sharp Bettor Timeline - use available horses */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <TicketBetGenerator horses={availableHorses} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LiveStreamingOdds horses={availableHorses} />
        <PoolsPanel 
          poolData={data.poolData} 
          exoticPools={data.exoticPools} 
          horses={availableHorses}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TrackProfile 
          statistics={data.trackProfile.statistics} 
          postPositions={data.trackProfile.postPositions}
          timings={data.trackProfile.timings}
        />
        <HorseComments comments={data.horseComments} horses={availableHorses} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PaceAnalysis paceData={data.paceData} horses={availableHorses} />
        <TrainingFigures figures={data.trainingFigures} />
      </div>
      
      {/* Video Performance Summary Grade */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <VideoPerformanceCard />
      </div>
      
      {/* Live Paddock Comments and AI-Thorian Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <LivePaddockComments comments={data.paddockComments} />
        <AIThorianValue valuePicks={data.valuePicks} pick3Combos={data.pick3Combos} />
      </div>
    </>
  );
};

export default DashboardContent;
