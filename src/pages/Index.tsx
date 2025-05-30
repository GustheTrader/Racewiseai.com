
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ScraperDataDashboard from '@/components/dashboard/ScraperDataDashboard';

const Index = () => {
  return (
    <DashboardLayout
      title="RaceWiseAI ToolBox"
      subtitle="Advanced horse racing analytics and betting intelligence platform"
    >
      <ScraperDataDashboard />
    </DashboardLayout>
  );
};

export default Index;
