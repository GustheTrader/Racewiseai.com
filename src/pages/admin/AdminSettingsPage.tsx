import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { Loader2, Save, Key, Globe, TestTube } from 'lucide-react';
import { SystemLogsViewer } from '@/components/admin/SystemLogsViewer';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('api_connections_safe')
          .select('api_url, api_key_masked, is_test_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setApiUrl(data.api_url || '');
          // api_key is never returned to the client for security; show masked placeholder
          setApiKey(data.api_key_masked ? '' : '');
          setIsTestMode(data.is_test_mode !== false);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        user_id: user.id,
        api_url: apiUrl,
        is_test_mode: isTestMode,
        updated_at: new Date().toISOString(),
      };
      // Only send api_key when the user typed a new value — never round-trip masked/empty
      if (apiKey && apiKey.trim().length > 0) {
        payload.api_key = apiKey;
      }
      const { error } = await supabase
        .from('api_connections')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Settings saved');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Configure API connections and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Configure external API connections for data scraping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="testMode">Test Mode</Label>
              </div>
              <Switch
                id="testMode"
                checked={isTestMode}
                onCheckedChange={setIsTestMode}
              />
            </div>

            <Button onClick={saveSettings} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Logs */}
        <SystemLogsViewer />
      </div>
    </div>
  );
};

export default AdminSettingsPage;
