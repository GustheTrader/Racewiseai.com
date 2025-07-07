import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
// Note: OddsPulse utilities removed - using local config for now
import { Loader2 } from 'lucide-react';
import useOddsPulseManager from '@/hooks/useOddsPulseManager';

interface OddsPulseConfigTabProps {
  trackName?: string;
  raceNumber?: number;
}

const OddsPulseConfigTab: React.FC<OddsPulseConfigTabProps> = ({ trackName, raceNumber }) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({ enabled: false, pollingInterval: 60 }); // Local config
  const [isSaving, setIsSaving] = useState(false);
  const [logData, setLogData] = useState<string[]>([]);
  const [isManualTesting, setIsManualTesting] = useState(false);
  
  // Use the odds pulse manager hook for the selected track/race
  const { isPolling, lastUpdate, error, forceUpdate } = useOddsPulseManager({
    trackName: trackName || "",
    raceNumber: raceNumber || 0,
    enabled: config.enabled
  });

  // Add log entries when relevant events occur
  useEffect(() => {
    if (lastUpdate) {
      addLog(`Odds data updated at ${new Date(lastUpdate).toLocaleTimeString()}`);
    }
    
    if (error) {
      addLog(`Error: ${error}`);
    }
  }, [lastUpdate, error]);

  const addLog = (message: string) => {
    setLogData(prev => {
      const newLogs = [message, ...prev];
      // Keep only the last 50 logs
      return newLogs.slice(0, 50);
    });
  };

  const handleToggleEnabled = (checked: boolean) => {
    setConfig({ ...config, enabled: checked });
  };

  const handlePollingIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setConfig({ ...config, pollingInterval: isNaN(value) ? 60 : value });
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    // Simulate a short delay for UI feedback
    setTimeout(() => {
      // setOddsPulseConfig(config); // Function removed - config saved locally
      addLog(`Configuration updated: enabled=${config.enabled}, interval=${config.pollingInterval}s`);
      setIsSaving(false);
    }, 500);
  };

  const handleManualTest = async () => {
    if (!trackName || !raceNumber) {
      toast({
        title: "Test Failed",
        description: "Please select a track and race first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsManualTesting(true);
    addLog(`Manual test initiated for ${trackName} Race ${raceNumber}`);
    
    // Force an odds update
    forceUpdate();
    
    // Just for UI feedback - actual operation happens in the hook
    setTimeout(() => {
      setIsManualTesting(false);
      toast({
        title: "Test Completed",
        description: "Check logs for details",
        duration: 3000,
      });
    }, 1500);
  };

  return (
    <>
      <Card className="bg-betting-navyBlue border-betting-mediumBlue mb-6">
        <CardHeader>
          <CardTitle>Odds Pulse API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="api-enabled"
              checked={config.enabled}
              onCheckedChange={handleToggleEnabled}
            />
            <Label htmlFor="api-enabled">Enable Odds Pulse API Integration</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pollingInterval">Polling Interval (seconds)</Label>
            <Input
              id="pollingInterval"
              type="number"
              value={config.pollingInterval}
              onChange={handlePollingIntervalChange}
              min={10}
              max={600}
              className="bg-betting-dark text-white border-betting-mediumBlue"
            />
          </div>
          
          <div className="pt-2">
            {isPolling && (
              <div className="flex items-center text-green-400 text-sm mb-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Polling active</span>
              </div>
            )}
            
            {lastUpdate && (
              <div className="text-sm text-gray-300">
                Last update: {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-400 mt-1">
                Error: {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button 
            onClick={handleSaveConfig}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
          <Button 
            variant="outline"
            onClick={handleManualTest}
            disabled={isManualTesting || !trackName || !raceNumber}
          >
            {isManualTesting ? "Testing..." : "Test Integration"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-betting-dark border-betting-mediumBlue">
        <CardHeader>
          <CardTitle className="flex items-center">
            Integration Logs
            {logData.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setLogData([])}
              >
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded p-4 overflow-auto max-h-60 text-sm">
            {logData.length === 0 ? (
              <div className="text-gray-500 italic">No logs yet</div>
            ) : (
              logData.map((log, index) => (
                <div key={index} className="pb-1 border-b border-gray-800 mb-1">
                  <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OddsPulseConfigTab;
