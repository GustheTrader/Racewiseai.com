import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://racewiseai.com",
  "https://www.racewiseai.com",
  "https://app.racewiseai.com",
  "https://bqvavkzgmznjfirgfyhd.lovableproject.com",
  "https://racewiseai.lovable.app",
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface EmailRequest {
  action: "send" | "send-template" | "broadcast" | "test";
  to?: string | string[];
  template_name?: string;
  template_variables?: Record<string, string>;
  subject?: string;
  html?: string;
  text?: string;
  broadcast_id?: string;
}

function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

async function sendViaResend(
  to: string[],
  subject: string,
  html: string,
  text: string,
  fromName: string,
  fromEmail: string,
  replyTo?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const payload: Record<string, unknown> = {
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    };

    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Resend API error: ${response.status}`,
      };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role for broadcast and test actions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = userRole?.role === "admin";

    const body: EmailRequest = await req.json();

    // Load email config
    const { data: emailConfig } = await supabase
      .from("email_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    const fromName = emailConfig?.from_name || "RaceWise AI";
    const fromEmail = emailConfig?.from_email || "noreply@racewiseai.com";
    const replyTo = emailConfig?.reply_to_email || undefined;

    switch (body.action) {
      case "send": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const recipients = Array.isArray(body.to) ? body.to : [body.to];
        if (!recipients.length || !body.subject || !body.html) {
          return new Response(
            JSON.stringify({
              error: "Missing required fields: to, subject, html",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const results = [];
        for (const email of recipients) {
          const result = await sendViaResend(
            [email],
            body.subject,
            body.html,
            body.text || "",
            fromName,
            fromEmail,
            replyTo
          );

          await supabase.from("email_logs").insert({
            recipient_email: email,
            subject: body.subject,
            status: result.success ? "sent" : "failed",
            provider_message_id: result.messageId,
            error_message: result.error,
            sent_at: result.success ? new Date().toISOString() : null,
          });

          results.push({ email, ...result });
        }

        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "send-template": {
        if (!body.template_name) {
          return new Response(
            JSON.stringify({ error: "template_name is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Load template
        const { data: template, error: templateError } = await supabase
          .from("email_templates")
          .select("*")
          .eq("name", body.template_name)
          .eq("is_active", true)
          .single();

        if (templateError || !template) {
          return new Response(
            JSON.stringify({ error: "Template not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const vars = body.template_variables || {};
        const subject = replaceVariables(template.subject, vars);
        const html = replaceVariables(template.html_body, vars);
        const text = template.text_body
          ? replaceVariables(template.text_body, vars)
          : "";

        const recipients = Array.isArray(body.to) ? body.to : [body.to];

        const results = [];
        for (const email of recipients) {
          // Check user notification preferences
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("notification_preferences")
            .eq("user_id", email)
            .maybeSingle();

          const prefs = profile?.notification_preferences as Record<
            string,
            boolean
          > | null;

          // Check if email notifications are disabled
          if (prefs && prefs.email_enabled === false) {
            results.push({
              email,
              success: false,
              error: "User has email notifications disabled",
            });
            continue;
          }

          // Check specific notification type
          const notificationType = template.template_type;
          if (
            notificationType === "notification" &&
            prefs &&
            prefs.race_results === false &&
            prefs.morning_reports === false
          ) {
            results.push({
              email,
              success: false,
              error: "User has this notification type disabled",
            });
            continue;
          }

          const result = await sendViaResend(
            [email],
            subject,
            html,
            text,
            fromName,
            fromEmail,
            replyTo
          );

          await supabase.from("email_logs").insert({
            template_id: template.id,
            recipient_email: email,
            subject,
            status: result.success ? "sent" : "failed",
            provider_message_id: result.messageId,
            error_message: result.error,
            sent_at: result.success ? new Date().toISOString() : null,
          });

          results.push({ email, ...result });
        }

        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "broadcast": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (!body.broadcast_id) {
          return new Response(
            JSON.stringify({ error: "broadcast_id is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Load broadcast
        const { data: broadcast, error: broadcastError } = await supabase
          .from("email_broadcasts")
          .select("*")
          .eq("id", body.broadcast_id)
          .single();

        if (broadcastError || !broadcast) {
          return new Response(
            JSON.stringify({ error: "Broadcast not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get target audience
        let userQuery = supabase
          .from("profiles")
          .select("id, email");

        if (broadcast.target_audience === "admins") {
          const { data: adminRoles } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");

          const adminIds = (adminRoles || []).map((r) => r.user_id);
          if (adminIds.length === 0) {
            await supabase
              .from("email_broadcasts")
              .update({ status: "completed", total_recipients: 0 })
              .eq("id", body.broadcast_id);

            return new Response(
              JSON.stringify({ message: "No admin users found" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          userQuery = userQuery.in("id", adminIds);
        }

        const { data: users } = await userQuery;

        const recipients = (users || []).filter((u) => u.email);

        await supabase
          .from("email_broadcasts")
          .update({
            status: "sending",
            total_recipients: recipients.length,
          })
          .eq("id", body.broadcast_id);

        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of recipients) {
          // Check notification preferences
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("notification_preferences")
            .eq("user_id", recipient.id)
            .maybeSingle();

          const prefs = profile?.notification_preferences as Record<
            string,
            boolean
          > | null;

          if (prefs?.email_enabled === false || prefs?.promotions === false) {
            failedCount++;
            continue;
          }

          const vars = {
            content: broadcast.html_body,
            unsubscribe_url: `https://racewiseai.com/unsubscribe?email=${recipient.email}`,
          };

          const result = await sendViaResend(
            [recipient.email],
            broadcast.subject,
            replaceVariables(
              `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
              <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;">
                <h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1>
              </div>
              <div style="padding: 30px 0;">{{content}}</div>
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #888; font-size: 12px;">
                <p>RaceWise AI <a href="{{unsubscribe_url}}" style="color: #f59e0b;">Unsubscribe</a></p>
              </div>
            </body></html>`,
              vars
            ),
            broadcast.text_body || "",
            fromName,
            fromEmail,
            replyTo
          );

          await supabase.from("email_logs").insert({
            recipient_email: recipient.email,
            recipient_user_id: recipient.id,
            subject: broadcast.subject,
            status: result.success ? "sent" : "failed",
            provider_message_id: result.messageId,
            error_message: result.error,
            sent_at: result.success ? new Date().toISOString() : null,
            metadata: { broadcast_id: body.broadcast_id },
          });

          if (result.success) sentCount++;
          else failedCount++;
        }

        await supabase
          .from("email_broadcasts")
          .update({
            status: "completed",
            sent_count: sentCount,
            failed_count: failedCount,
            sent_at: new Date().toISOString(),
          })
          .eq("id", body.broadcast_id);

        return new Response(
          JSON.stringify({
            sent: sentCount,
            failed: failedCount,
            total: recipients.length,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "test": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const result = await sendViaResend(
          [user.email!],
          "RaceWise AI - Email Test",
          '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;"><div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f59e0b;"><h1 style="color: #f59e0b; margin: 0;">RaceWise AI</h1></div><div style="padding: 30px 0;"><h2 style="color: #fff;">Email Test Successful!</h2><p>Your email configuration is working correctly.</p><p style="color: #888; font-size: 12px;">Sent at: ' +
            new Date().toISOString() +
            "</p></div></body></html>",
          "Email test successful! Your RaceWise AI email configuration is working.",
          fromName,
          fromEmail,
          replyTo
        );

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({
            error:
              "Invalid action. Use: send, send-template, broadcast, or test",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Email function error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
