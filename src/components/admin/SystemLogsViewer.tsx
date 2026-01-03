import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SystemLog {
  log_id: number;
  timestamp: string | null;
  component: string | null;
  log_level: string | null;
  message: string;
  details: Record<string, unknown> | null;
}

export const SystemLogsViewer = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scrape' | 'error'>('scrape');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (filter === 'scrape') {
        query = query.ilike('component', '%scrape%');
      } else if (filter === 'error') {
        query = query.eq('log_level', 'error');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      setLogs((data || []) as SystemLog[]);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getLogIcon = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLogBadgeVariant = (level: string | null): "default" | "destructive" | "secondary" | "outline" => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          System Logs
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button
              variant={filter === 'scrape' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('scrape')}
            >
              Scrape Jobs
            </Button>
            <Button
              variant={filter === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('error')}
            >
              Errors
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Info className="h-8 w-8 mb-2" />
              <p>No logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.log_id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getLogIcon(log.log_level)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.message}</p>
                        {log.details && typeof log.details === 'object' && log.details !== null && (
                          <pre className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={getLogBadgeVariant(log.log_level)}>
                        {log.log_level || 'info'}
                      </Badge>
                      {log.component && (
                        <Badge variant="outline" className="text-xs">
                          {log.component}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp
                          ? format(new Date(log.timestamp), 'MMM d, HH:mm:ss')
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
