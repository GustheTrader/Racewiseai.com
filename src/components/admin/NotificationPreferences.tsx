import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Mail, Bell, Trophy, Newspaper, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/services/emailService";

interface NotificationPreferencesProps {
  userId: string;
}

const defaultPrefs = {
  email_enabled: true,
  race_results: true,
  morning_reports: true,
  promotions: true,
  alerts: true,
};

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
}) => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await getNotificationPreferences(userId);
      setPrefs({
        email_enabled: (data as typeof defaultPrefs)?.email_enabled ?? true,
        race_results: (data as typeof defaultPrefs)?.race_results ?? true,
        morning_reports: (data as typeof defaultPrefs)?.morning_reports ?? true,
        promotions: (data as typeof defaultPrefs)?.promotions ?? true,
        alerts: (data as typeof defaultPrefs)?.alerts ?? true,
      });
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNotificationPreferences(userId, prefs);
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePref = (key: string, value: boolean) => {
    if (key === "email_enabled" && !value) {
      setPrefs({
        email_enabled: false,
        race_results: false,
        morning_reports: false,
        promotions: false,
        alerts: false,
      });
    } else {
      setPrefs((prev) => ({ ...prev, [key]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const prefItems = [
    {
      key: "email_enabled",
      label: "Email Notifications",
      description: "Master toggle for all email notifications",
      icon: Mail,
    },
    {
      key: "race_results",
      label: "Race Results",
      description: "Notifications when watched races finish",
      icon: Trophy,
    },
    {
      key: "morning_reports",
      label: "Morning Reports",
      description: "Daily morning report for your favorite tracks",
      icon: Newspaper,
    },
    {
      key: "alerts",
      label: "Betting Alerts",
      description: "Alerts for odds changes and opportunities",
      icon: AlertTriangle,
    },
    {
      key: "promotions",
      label: "Promotions & Updates",
      description: "Platform news, features, and broadcast emails",
      icon: Bell,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which emails you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prefItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              !prefs.email_enabled && item.key !== "email_enabled"
                ? "opacity-50 border-border"
                : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor={item.key} className="font-medium">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={prefs[item.key as keyof typeof prefs]}
              onCheckedChange={(val) => updatePref(item.key, val)}
              disabled={
                !prefs.email_enabled && item.key !== "email_enabled"
              }
            />
          </div>
        ))}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
