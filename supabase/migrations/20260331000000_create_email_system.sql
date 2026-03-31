-- Email System Tables

-- Email configuration (stores provider settings)
CREATE TABLE IF NOT EXISTS public.email_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'resend',
  from_name TEXT NOT NULL DEFAULT 'RaceWise AI',
  from_email TEXT NOT NULL DEFAULT 'noreply@racewiseai.com',
  reply_to_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  template_type TEXT NOT NULL DEFAULT 'transactional',
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Email logs (tracks all sent emails)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email broadcasts (admin campaigns)
CREATE TABLE IF NOT EXISTS public.email_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  target_audience TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_user_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX idx_email_broadcasts_status ON public.email_broadcasts(status);

-- RLS Policies
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email config
CREATE POLICY "Admins can manage email config"
  ON public.email_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Only admins can manage email templates
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Only admins can view email logs
CREATE POLICY "Admins can view email logs"
  ON public.email_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON public.email_logs FOR SELECT
  USING (recipient_user_id = auth.uid());

-- Only admins can manage broadcasts
CREATE POLICY "Admins can manage broadcasts"
  ON public.email_broadcasts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_body, text_body, template_type, variables) VALUES
(
  'welcome',
  'Welcome to RaceWise AI!',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
    <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1>
    </div>
    <div style="padding: 30px 0;">
      <h2 style="color: #fff;">Welcome, {{user_name}}!</h2>
      <p>Thank you for joining RaceWise AI. You now have access to:</p>
      <ul style="line-height: 1.8;">
        <li>AI-powered race analysis</li>
        <li>Real-time odds tracking</li>
        <li>Personalized betting insights</li>
        <li>Quantum rankings and predictions</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboard_url}}" style="background: #f59e0b; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #888; font-size: 12px;">
      <p>RaceWise AI - Smart Horse Racing Analysis</p>
    </div>
  </body></html>',
  'Welcome to RaceWise AI, {{user_name}}! Thank you for joining. Visit your dashboard: {{dashboard_url}}',
  'transactional',
  '["user_name", "dashboard_url"]'::jsonb
),
(
  'race-results',
  'Race Results: {{track_name}} Race {{race_number}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
    <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1>
    </div>
    <div style="padding: 30px 0;">
      <h2 style="color: #fff;">Race Results: {{track_name}}</h2>
      <p>Race {{race_number}} - {{race_date}}</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #f59e0b; margin-top: 0;">Results</h3>
        {{results_html}}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{results_url}}" style="background: #f59e0b; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Results</a>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #888; font-size: 12px;">
      <p>You received this because you have race alerts enabled. <a href="{{unsubscribe_url}}" style="color: #f59e0b;">Unsubscribe</a></p>
    </div>
  </body></html>',
  'Race Results: {{track_name}} Race {{race_number}} - {{race_date}}. View results: {{results_url}}',
  'notification',
  '["track_name", "race_number", "race_date", "results_html", "results_url", "unsubscribe_url"]'::jsonb
),
(
  'broadcast',
  '{{subject}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
    <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1>
    </div>
    <div style="padding: 30px 0;">
      {{content}}
    </div>
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #888; font-size: 12px;">
      <p>RaceWise AI <a href="{{unsubscribe_url}}" style="color: #f59e0b;">Unsubscribe</a></p>
    </div>
  </body></html>',
  '{{content}}',
  'broadcast',
  '["subject", "content", "unsubscribe_url"]'::jsonb
),
(
  'morning-report',
  'Morning Report: {{track_name}} - {{race_date}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
    <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1>
    </div>
    <div style="padding: 30px 0;">
      <h2 style="color: #fff;">Morning Report: {{track_name}}</h2>
      <p>{{race_date}} - {{total_races}} Races</p>
      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        {{report_content}}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{report_url}}" style="background: #f59e0b; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Report</a>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #888; font-size: 12px;">
      <p>You received this because you have morning reports enabled. <a href="{{unsubscribe_url}}" style="color: #f59e0b;">Unsubscribe</a></p>
    </div>
  </body></html>',
  'Morning Report: {{track_name}} - {{race_date}}. View report: {{report_url}}',
  'notification',
  '["track_name", "race_date", "total_races", "report_content", "report_url", "unsubscribe_url"]'::jsonb
);

-- Update notification_preferences default in user_profiles
ALTER TABLE public.user_profiles 
  ALTER COLUMN notification_preferences SET DEFAULT '{
    "email_enabled": true,
    "race_results": true,
    "morning_reports": true,
    "promotions": true,
    "alerts": true
  }'::jsonb;
