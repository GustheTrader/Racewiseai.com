import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Calendar, Sun, Moon, Loader2, Save, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleConfig {
  id: string;
  track_name: string;
  is_enabled: boolean;
  schedule_hour: number;
  schedule_minute: number;
  timezone: string;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
];

const DEFAULT_TRACKS = [
  'Santa Anita Park',
  'Gulfstream Park',
  'Churchill Downs',
  'Aqueduct',
  'Turfway Park',
  'Oaklawn Park',
];

const AdminSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scrape_schedule_config')
        .select('*')
        .order('track_name');

      if (error) throw error;

      // Initialize missing tracks
      const existingTracks = new Set(data?.map(d => d.track_name) || []);
      const missingTracks = DEFAULT_TRACKS.filter(t => !existingTracks.has(t));

      if (missingTracks.length > 0) {
        const newConfigs = missingTracks.map(track => ({
          track_name: track,
          is_enabled: false,
          schedule_hour: 6,
          schedule_minute: 0,
          timezone: 'America/New_York'
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('scrape_schedule_config')
          .insert(newConfigs)
          .select();

        if (!insertError && inserted) {
          setSchedules([...(data || []), ...inserted]);
        } else {
          setSchedules(data || []);
        }
      } else {
        setSchedules(data || []);
      }
    } catch (err: any) {
      console.error('Error loading schedules:', err);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ScheduleConfig>) => {
    try {
      const { error } = await supabase
        .from('scrape_schedule_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Schedule updated');
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      toast.error('Failed to update schedule');
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const date = new Date();
    date.setHours(hour, minute);
    return format(date, 'h:mm a');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scraping Schedule</h2>
          <p className="text-muted-foreground">Configure automatic morning report and live odds scraping times</p>
        </div>
        <Button variant="outline" onClick={loadSchedules}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Schedule Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <Sun className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-500">AM Morning Report</h3>
              <p className="text-sm text-muted-foreground">Runs once at scheduled time to fetch race entries, jockeys, trainers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Moon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-500">Live Race Day Odds</h3>
              <p className="text-sm text-muted-foreground">Continuous scraping during race hours (post times to last race)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Track Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className={`border ${schedule.is_enabled ? 'border-primary/50' : 'border-border'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{schedule.track_name}</CardTitle>
                <Switch
                  checked={schedule.is_enabled}
                  onCheckedChange={(checked) => updateSchedule(schedule.id, { is_enabled: checked })}
                />
              </div>
              <CardDescription>
                {schedule.is_enabled ? (
                  <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/30">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Morning Report Time</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={schedule.schedule_hour}
                      onChange={(e) => updateSchedule(schedule.id, { schedule_hour: parseInt(e.target.value) || 0 })}
                      className="w-14 text-center"
                      placeholder="HH"
                    />
                    <span className="flex items-center">:</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={schedule.schedule_minute}
                      onChange={(e) => updateSchedule(schedule.id, { schedule_minute: parseInt(e.target.value) || 0 })}
                      className="w-14 text-center"
                      placeholder="MM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Timezone</Label>
                  <Select
                    value={schedule.timezone}
                    onValueChange={(value) => updateSchedule(schedule.id, { timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Display Time</Label>
                  <div className="flex items-center h-10 px-3 rounded-md bg-muted text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatTime(schedule.schedule_hour, schedule.schedule_minute)}
                  </div>
                </div>
              </div>

              {schedule.is_enabled && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <strong>Morning:</strong> Scrapes at {formatTime(schedule.schedule_hour, schedule.schedule_minute)} {TIMEZONES.find(t => t.value === schedule.timezone)?.label}
                  <br />
                  <strong>Live:</strong> Auto-starts 30 min before first post, runs every 60s until last race
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSchedulePage;
