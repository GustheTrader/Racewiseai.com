
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { updateMockData, getMockData } from '@/utils/mockData';

interface DataImportTabProps {
  apiUrl: string;
  apiKey: string;
  isTestMode: boolean;
}

const DataImportTab: React.FC<DataImportTabProps> = ({
  apiUrl,
  apiKey,
  isTestMode
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleImportData = async () => {
    setIsLoading(true);
    
    try {
      // In real implementation, this would fetch from the actual API
      // For now, simulate data import with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update mock data with "imported" data
      const importedData = {
        horses: getMockData().horses.map(horse => ({
          ...horse,
          liveOdds: parseFloat((horse.liveOdds * (0.9 + Math.random() * 0.3)).toFixed(2))
        }))
      };
      
      updateMockData(importedData);
      
      toast({
        title: "Data Imported",
        description: "Race data has been successfully imported.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardHeader>
        <CardTitle>Import Race Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-4">
          This will import the latest race data from the configured API.
          Make sure your API connection is properly set up before proceeding.
        </p>
        
        <div className="bg-betting-dark border border-betting-mediumBlue rounded-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>API URL:</div>
            <div className="font-mono truncate">{apiUrl || "Not set"}</div>
            
            <div>API Key:</div>
            <div>{apiKey ? "••••••••" : "Not set"}</div>
            
            <div>Mode:</div>
            <div>{isTestMode ? "Test Mode (Mock Data)" : "Production Mode"}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImportData}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Importing..." : "Import Latest Race Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataImportTab;
