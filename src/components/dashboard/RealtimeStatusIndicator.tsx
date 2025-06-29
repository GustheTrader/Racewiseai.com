
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff } from 'lucide-react';

const RealtimeStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Test real-time connection
    const channel = supabase
      .channel('connection-test')
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setLastUpdate(new Date());
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    // Periodic connection check
    const interval = setInterval(() => {
      const now = new Date();
      if (lastUpdate && (now.getTime() - lastUpdate.getTime()) > 30000) {
        setIsConnected(false);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Badge variant="default" className="bg-green-600 flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Real-time Connected
        </Badge>
      ) : (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Real-time Disconnected
        </Badge>
      )}
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          Last: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default RealtimeStatusIndicator;
