import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Mail,
  Send,
  FileText,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getEmailConfig,
  saveEmailConfig,
  sendTestEmail,
  getEmailTemplates,
  saveEmailTemplate,
  getEmailLogs,
} from "@/services/emailService";

interface EmailConfig {
  id?: string;
  provider: string;
  from_name: string;
  from_email: string;
  reply_to_email: string;
  is_active: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  template_type: string;
  variables: string[];
  is_active: boolean;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

const AdminEmailPage: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    provider: "resend",
    from_name: "RaceWise AI",
    from_email: "noreply@racewiseai.com",
    reply_to_email: "",
    is_active: false,
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configData, templatesData, logsData] = await Promise.all([
        getEmailConfig(),
        getEmailTemplates(),
        getEmailLogs(20),
      ]);

      if (configData) {
        const cfg = configData as Record<string, unknown>;
        setConfig({
          id: cfg.id as string,
          provider: cfg.provider as string,
          from_name: cfg.from_name as string,
          from_email: cfg.from_email as string,
          reply_to_email: (cfg.reply_to_email as string) || "",
          is_active: cfg.is_active as boolean,
        });
      }

      setTemplates(
        (templatesData || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          name: t.name as string,
          subject: t.subject as string,
          html_body: t.html_body as string,
          text_body: t.text_body as string,
          template_type: t.template_type as string,
          variables: Array.isArray(t.variables) ? (t.variables as string[]) : [],
          is_active: t.is_active as boolean,
        }))
      );
      setLogs((logsData || []).map((l: Record<string, unknown>) => ({
        id: l.id as string,
        recipient_email: l.recipient_email as string,
        subject: l.subject as string,
        status: l.status as string,
        error_message: l.error_message as string | null,
        sent_at: l.sent_at as string | null,
        created_at: l.created_at as string,
      })));
    } catch (error) {
      console.error("Error loading email data:", error);
      toast.error("Failed to load email configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await saveEmailConfig(config);
      toast.success("Email configuration saved");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    try {
      const result = await sendTestEmail();
      if (result.success) {
        toast.success("Test email sent successfully!");
        loadData();
      } else {
        toast.error(`Test failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      await saveEmailTemplate(selectedTemplate);
      toast.success("Template saved");
      loadData();
    } catch (error) {
      toast.error("Failed to save template");
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
        <h2 className="text-2xl font-bold">Email System</h2>
        <p className="text-muted-foreground">
          Configure email provider, manage templates, and view delivery logs
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Delivery Logs
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Provider (Resend)
                </CardTitle>
                <CardDescription>
                  Configure your Resend email provider settings. API key is
                  stored securely in Supabase secrets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input id="provider" value="Resend" disabled />
                  <p className="text-xs text-muted-foreground">
                    Set RESEND_API_KEY in Supabase Edge Function secrets to
                    activate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={config.from_name}
                    onChange={(e) =>
                      setConfig({ ...config, from_name: e.target.value })
                    }
                    placeholder="RaceWise AI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config.from_email}
                    onChange={(e) =>
                      setConfig({ ...config, from_email: e.target.value })
                    }
                    placeholder="noreply@racewiseai.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email (optional)</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={config.reply_to_email}
                    onChange={(e) =>
                      setConfig({ ...config, reply_to_email: e.target.value })
                    }
                    placeholder="support@racewiseai.com"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <Label htmlFor="isActive">Email System Active</Label>
                  <Switch
                    id="isActive"
                    checked={config.is_active}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, is_active: checked })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestEmail}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>
                  Steps to activate the email system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <Badge className="shrink-0 mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Create a Resend account</p>
                      <p className="text-muted-foreground">
                        Sign up at resend.com and get your API key
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Badge className="shrink-0 mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">
                        Configure Supabase secret
                      </p>
                      <p className="text-muted-foreground">
                        Run:{" "}
                        <code className="bg-muted px-1 rounded">
                          supabase secrets set RESEND_API_KEY=re_your_key
                        </code>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Badge className="shrink-0 mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Verify your domain</p>
                      <p className="text-muted-foreground">
                        Add DNS records in Resend for your sending domain
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Badge className="shrink-0 mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Deploy the edge function</p>
                      <p className="text-muted-foreground">
                        Run:{" "}
                        <code className="bg-muted px-1 rounded">
                          supabase functions deploy send-email
                        </code>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Badge className="shrink-0 mt-0.5">5</Badge>
                    <div>
                      <p className="font-medium">Send a test email</p>
                      <p className="text-muted-foreground">
                        Click "Send Test" to verify everything works
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Select a template to edit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {template.name.replace(/-/g, " ")}
                      </span>
                      <Badge
                        variant={
                          template.template_type === "transactional"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {template.template_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {template.subject}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="capitalize">
                    Edit: {selectedTemplate.name.replace(/-/g, " ")}
                  </CardTitle>
                  <CardDescription>
                    Variables:{" "}
                    {selectedTemplate.variables.length > 0
                      ? selectedTemplate.variables
                          .map((v) => `{{${v}}}`)
                          .join(", ")
                      : "None"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={selectedTemplate.subject}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          subject: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HTML Body</Label>
                    <Textarea
                      value={selectedTemplate.html_body}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          html_body: e.target.value,
                        })
                      }
                      rows={12}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plain Text Body</Label>
                    <Textarea
                      value={selectedTemplate.text_body || ""}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          text_body: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedTemplate.is_active}
                        onCheckedChange={(checked) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            is_active: checked,
                          })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                    <Button
                      onClick={handleSaveTemplate}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Logs</CardTitle>
                  <CardDescription>
                    Recent email delivery activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Recipient
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Subject
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Sent
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No email logs yet
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="p-3">
                            {log.status === "sent" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </td>
                          <td className="p-3 text-sm">
                            {log.recipient_email}
                          </td>
                          <td className="p-3 text-sm truncate max-w-[200px]">
                            {log.subject}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {log.sent_at
                              ? new Date(log.sent_at).toLocaleString()
                              : "—"}
                          </td>
                          <td className="p-3 text-sm text-destructive truncate max-w-[150px]">
                            {log.error_message || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmailPage;
