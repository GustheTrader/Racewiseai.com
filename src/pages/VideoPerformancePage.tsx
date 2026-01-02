import React from 'react';
import VideoPerformanceCard from '../components/VideoPerformanceCard';
import { RiskAgentCard } from '../components/RiskAgentCard';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const VideoPerformancePage = () => {
  return (
    <DashboardLayout 
      title="Video Performance Analysis"
      subtitle="CV/VLM Risk Agent for lameness, gait, and behavior analysis"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskAgentCard />
        <VideoPerformanceCard />
      </div>
    </DashboardLayout>
  );
};

export default VideoPerformancePage;