import React from 'react';
import TwinSpiresModelTab from '@/components/admin/TwinSpiresModelTab';
import TrdModelUploadTab from '@/components/admin/TrdModelUploadTab';
import ModelTrainingTab from '@/components/admin/ModelTrainingTab';

const AdminModelsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Models & Training</h2>
        <p className="text-muted-foreground">Manage prediction models and training data</p>
      </div>

      <TwinSpiresModelTab />
      <TrdModelUploadTab />
      <ModelTrainingTab />
    </div>
  );
};

export default AdminModelsPage;
