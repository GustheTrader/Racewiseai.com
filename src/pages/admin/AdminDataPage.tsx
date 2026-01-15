import React from 'react';
import ScrapedDataViewer from '@/components/admin/ScrapedDataViewer';
import LiveModelReports from '@/components/dashboard/LiveModelReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDataPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Viewer</h2>
        <p className="text-muted-foreground">View and manage scraped racing data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScrapedDataViewer />
        </div>
        <div className="lg:col-span-1">
          <LiveModelReports />
        </div>
      </div>
    </div>
  );
};

export default AdminDataPage;
