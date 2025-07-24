import React from 'react';
import VideoPerformanceCard from '../components/VideoPerformanceCard';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const VideoPerformancePage = () => {
  return (
    <DashboardLayout 
      title="Video Performance Analysis"
      subtitle="Comprehensive video grade analysis for race performance"
    >
      <div className="h-full">
        <VideoPerformanceCard />
      </div>
    </DashboardLayout>
  );
};

export default VideoPerformancePage;