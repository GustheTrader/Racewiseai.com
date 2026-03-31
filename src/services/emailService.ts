import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://bqvavkzgmznjfirgfyhd.supabase.co";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function callEmailFunction(payload: Record<string, unknown>): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendTestEmail() {
  return callEmailFunction({ action: "test" });
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  return callEmailFunction({
    action: "send",
    ...params,
  });
}

export async function sendTemplateEmail(params: {
  to: string | string[];
  template_name: string;
  template_variables?: Record<string, string>;
}) {
  return callEmailFunction({
    action: "send-template",
    ...params,
  });
}

export async function triggerBroadcast(broadcastId: string) {
  return callEmailFunction({
    action: "broadcast",
    broadcast_id: broadcastId,
  });
}

// Email config CRUD
export async function getEmailConfig() {
  const { data, error } = await db
    .from("email_config")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveEmailConfig(config: {
  provider: string;
  from_name: string;
  from_email: string;
  reply_to_email?: string;
  is_active: boolean;
}) {
  const existing = await getEmailConfig();

  if (existing) {
    const { data, error } = await db
      .from("email_config")
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await db
      .from("email_config")
      .insert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Email templates CRUD
export async function getEmailTemplates() {
  const { data, error } = await db
    .from("email_templates")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function saveEmailTemplate(template: {
  id?: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  template_type: string;
  variables?: string[];
  is_active?: boolean;
}) {
  if (template.id) {
    const { data, error } = await db
      .from("email_templates")
      .update({
        ...template,
        variables: template.variables || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", template.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await db
      .from("email_templates")
      .insert({
        ...template,
        variables: template.variables || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Email logs
export async function getEmailLogs(limit = 50, offset = 0) {
  const { data, error } = await db
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

// Broadcasts CRUD
export async function getBroadcasts() {
  const { data, error } = await db
    .from("email_broadcasts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveBroadcast(broadcast: {
  id?: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  target_audience: string;
  status?: string;
  scheduled_at?: string;
}) {
  if (broadcast.id) {
    const { data, error } = await db
      .from("email_broadcasts")
      .update({
        ...broadcast,
        updated_at: new Date().toISOString(),
      })
      .eq("id", broadcast.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await db
      .from("email_broadcasts")
      .insert(broadcast)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function deleteBroadcast(id: string) {
  const { error } = await db
    .from("email_broadcasts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// User profiles notification preferences
export async function getNotificationPreferences(userId: string) {
  const { data, error } = await db
    .from("user_profiles")
    .select("notification_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.notification_preferences || {
    email_enabled: true,
    race_results: true,
    morning_reports: true,
    promotions: true,
    alerts: true,
  };
}

export async function saveNotificationPreferences(
  userId: string,
  preferences: Record<string, boolean>
) {
  const { error } = await db
    .from("user_profiles")
    .update({
      notification_preferences: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}

// Get all users for broadcast targeting
export async function getAllUsers() {
  const { data, error } = await db
    .from("profiles")
    .select("id, email, full_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
