import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Play, Clock, Database } from 'lucide-react';
import { ScraperStats } from '@/types/ScraperTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
  stats: ScraperStats;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalRecords = (stats?.oddsRecords || 0) + (stats?.willPaysRecords || 0) + (stats?.resultsRecords || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <h3 className="text-2xl font-bold">{stats?.totalJobs || 0}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
            <h3 className="text-2xl font-bold">{stats?.activeJobs || 0}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Play className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Records</p>
            <h3 className="text-2xl font-bold">{totalRecords}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Database className="h-5 w-5 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Last Execution</p>
            <h3 className="text-sm font-medium">
              {stats?.lastExecutionTime 
                ? new Date(stats.lastExecutionTime).toLocaleString()
                : 'Never'}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
