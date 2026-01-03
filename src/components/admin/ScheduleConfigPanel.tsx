import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Settings, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackConfig {
  id: string;
  track_name: string;
  is_enabled: boolean;
  schedule_hour: number;
  schedule_minute: number;
  timezone: string;
}

const ScheduleConfigPanel: React.FC = () => {
  const [configs, setConfigs] = useState<TrackConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalHour, setGlobalHour] = useState('6');
  const [globalMinute, setGlobalMinute] = useState('0');

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scrape_schedule_config')
        .select('*')
        .order('track_name');

      if (error) throw error;
      setConfigs(data || []);
      
      // Set global time from first config
      if (data && data.length > 0) {
        setGlobalHour(String(data[0].schedule_hour));
        setGlobalMinute(String(data[0].schedule_minute));
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
      toast.error('Failed to load schedule configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const toggleTrack = async (trackId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('scrape_schedule_config')
        .update({ is_enabled: !currentEnabled })
        .eq('id', trackId);

      if (error) throw error;

      setConfigs(prev => 
        prev.map(c => c.id === trackId ? { ...c, is_enabled: !currentEnabled } : c)
      );
      toast.success(`Track ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error toggling track:', err);
      toast.error('Failed to update track');
    }
  };

  const saveScheduleTime = async () => {
    setIsSaving(true);
    try {
      const hour = parseInt(globalHour);
      const minute = parseInt(globalMinute);

      const { error } = await supabase
        .from('scrape_schedule_config')
        .update({ schedule_hour: hour, schedule_minute: minute })
        .neq('id', ''); // Update all rows

      if (error) throw error;

      setConfigs(prev => 
        prev.map(c => ({ ...c, schedule_hour: hour, schedule_minute: minute }))
      );
      toast.success(`Schedule updated to ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`);
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const runManualScrape = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-morning-scrape');
      
      if (error) throw error;

      if (data.success) {
        toast.success(`Scrape completed: ${data.message}`);
      } else {
        toast.error(data.error || 'Scrape failed');
      }
    } catch (err: any) {
      console.error('Error running manual scrape:', err);
      toast.error(err.message || 'Failed to run scrape');
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = configs.filter(c => c.is_enabled).length;

  if (isLoading) {
    return (
      <Card className="bg-[#131a2e] border-blue-900/30">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#131a2e] border-blue-900/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-500" />
            Scheduled Scrape Config
          </CardTitle>
          <Badge variant="outline" className="border-green-600/50 text-green-400">
            {enabledCount} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule Time */}
        <div className="p-3 bg-[#0d1221] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Daily Schedule (UTC)</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={globalHour} onValueChange={setGlobalHour}>
              <SelectTrigger className="w-20 bg-[#131a2e] border-blue-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#131a2e] border-blue-900/30">
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)} className="text-white">
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-500">:</span>
            <Select value={globalMinute} onValueChange={setGlobalMinute}>
              <SelectTrigger className="w-20 bg-[#131a2e] border-blue-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#131a2e] border-blue-900/30">
                {[0, 15, 30, 45].map(m => (
                  <SelectItem key={m} value={String(m)} className="text-white">
                    {m.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={saveScheduleTime}
              disabled={isSaving}
              className="ml-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {configs.map(config => (
            <div 
              key={config.id} 
              className="flex items-center justify-between p-2 bg-[#0d1221] rounded"
            >
              <span className={`text-sm ${config.is_enabled ? 'text-white' : 'text-gray-500'}`}>
                {config.track_name}
              </span>
              <Switch
                checked={config.is_enabled}
                onCheckedChange={() => toggleTrack(config.id, config.is_enabled)}
              />
            </div>
          ))}
        </div>

        {/* Manual Run Button */}
        <Button 
          onClick={runManualScrape}
          disabled={isSaving || enabledCount === 0}
          variant="outline"
          className="w-full border-amber-600/50 text-amber-400 hover:bg-amber-600/10"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run Scrape Now ({enabledCount} tracks)
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScheduleConfigPanel;
