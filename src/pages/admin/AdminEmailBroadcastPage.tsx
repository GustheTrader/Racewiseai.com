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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  RefreshCw,
  Edit,
} from "lucide-react";
import {
  getBroadcasts,
  saveBroadcast,
  deleteBroadcast,
  triggerBroadcast,
  getAllUsers,
} from "@/services/emailService";

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  target_audience: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

const AdminEmailBroadcastPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
  }>({ open: false, id: "" });
  const [sendDialog, setSendDialog] = useState<{
    open: boolean;
    broadcast: Broadcast | null;
  }>({ open: false, broadcast: null });

  const [editor, setEditor] = useState({
    isOpen: false,
    id: "",
    name: "",
    subject: "",
    html_body: "",
    text_body: "",
    target_audience: "all",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [broadcastsData, users] = await Promise.all([
        getBroadcasts(),
        getAllUsers(),
      ]);
      setBroadcasts(
        (broadcastsData || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          name: b.name as string,
          subject: b.subject as string,
          html_body: b.html_body as string,
          text_body: b.text_body as string | null,
          target_audience: b.target_audience as string,
          status: b.status as string,
          total_recipients: (b.total_recipients as number) || 0,
          sent_count: (b.sent_count as number) || 0,
          failed_count: (b.failed_count as number) || 0,
          scheduled_at: b.scheduled_at as string | null,
          sent_at: b.sent_at as string | null,
          created_at: b.created_at as string,
        }))
      );
      setUserCount(users.length);
    } catch (error) {
      console.error("Error loading broadcasts:", error);
      toast.error("Failed to load broadcasts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editor.name || !editor.subject || !editor.html_body) {
      toast.error("Please fill in name, subject, and body");
      return;
    }

    setIsSaving(true);
    try {
      await saveBroadcast({
        id: editor.id || undefined,
        name: editor.name,
        subject: editor.subject,
        html_body: editor.html_body,
        text_body: editor.text_body || undefined,
        target_audience: editor.target_audience,
        status: "draft",
      });

      toast.success(
        editor.id ? "Broadcast updated" : "Broadcast created"
      );
      setEditor({
        isOpen: false,
        id: "",
        name: "",
        subject: "",
        html_body: "",
        text_body: "",
        target_audience: "all",
      });
      loadData();
    } catch (error) {
      toast.error("Failed to save broadcast");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async (broadcast: Broadcast) => {
    setIsSending(broadcast.id);
    try {
      const result = await triggerBroadcast(broadcast.id);
      if (result.success) {
        const data = result.data as {
          sent: number;
          failed: number;
          total: number;
        };
        toast.success(
          `Broadcast sent: ${data.sent} delivered, ${data.failed} failed`
        );
      } else {
        toast.error(`Send failed: ${result.error}`);
      }
      loadData();
    } catch (error) {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(null);
      setSendDialog({ open: false, broadcast: null });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBroadcast(deleteDialog.id);
      toast.success("Broadcast deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete broadcast");
    } finally {
      setDeleteDialog({ open: false, id: "" });
    }
  };

  const openEditor = (broadcast?: Broadcast) => {
    if (broadcast) {
      setEditor({
        isOpen: true,
        id: broadcast.id,
        name: broadcast.name,
        subject: broadcast.subject,
        html_body: broadcast.html_body,
        text_body: broadcast.text_body || "",
        target_audience: broadcast.target_audience,
      });
    } else {
      setEditor({
        isOpen: true,
        id: "",
        name: "",
        subject: "",
        html_body: "",
        text_body: "",
        target_audience: "all",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "sending":
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAudienceCount = (audience: string) => {
    if (audience === "all") return userCount;
    if (audience === "admins") return 1;
    return userCount;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Broadcasts</h2>
          <p className="text-muted-foreground">
            Compose and send emails to users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Editor Dialog */}
      {editor.isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editor.id ? "Edit Broadcast" : "New Broadcast"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Broadcast Name</Label>
                <Input
                  value={editor.name}
                  onChange={(e) =>
                    setEditor({ ...editor, name: e.target.value })
                  }
                  placeholder="March Newsletter"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={editor.target_audience}
                  onValueChange={(val) =>
                    setEditor({ ...editor, target_audience: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Users ({userCount})
                    </SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={editor.subject}
                onChange={(e) =>
                  setEditor({ ...editor, subject: e.target.value })
                }
                placeholder="What's new at RaceWise AI"
              />
            </div>

            <div className="space-y-2">
              <Label>Email Content (HTML)</Label>
              <Textarea
                value={editor.html_body}
                onChange={(e) =>
                  setEditor({ ...editor, html_body: e.target.value })
                }
                rows={10}
                placeholder="<h2>Hello!</h2><p>Your email content here...</p>"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Basic HTML supported. The email wrapper (header/footer) is
                applied automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Plain Text Version (optional)</Label>
              <Textarea
                value={editor.text_body}
                onChange={(e) =>
                  setEditor({ ...editor, text_body: e.target.value })
                }
                rows={4}
                placeholder="Plain text version of your email"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setEditor({ ...editor, isOpen: false })
                }
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Broadcasts List */}
      <div className="space-y-3">
        {broadcasts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No broadcasts yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first email broadcast to reach your users
              </p>
              <Button className="mt-4" onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Broadcast
              </Button>
            </CardContent>
          </Card>
        ) : (
          broadcasts.map((broadcast) => (
            <Card key={broadcast.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(broadcast.status)}
                    <div>
                      <h3 className="font-medium">{broadcast.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {broadcast.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {broadcast.target_audience === "all"
                            ? "All Users"
                            : "Admins"}
                        </span>
                      </div>
                      {broadcast.status === "completed" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {broadcast.sent_count} sent / {broadcast.failed_count}{" "}
                          failed
                        </div>
                      )}
                    </div>

                    <Badge
                      variant={
                        broadcast.status === "completed"
                          ? "default"
                          : broadcast.status === "sending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {broadcast.status}
                    </Badge>

                    <div className="flex gap-1">
                      {broadcast.status === "draft" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditor(broadcast)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() =>
                              setSendDialog({
                                open: true,
                                broadcast,
                              })
                            }
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            id: broadcast.id,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Send Confirmation Dialog */}
      <AlertDialog
        open={sendDialog.open}
        onOpenChange={(open) =>
          setSendDialog({ open, broadcast: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send "
              {sendDialog.broadcast?.name}" to{" "}
              {getAudienceCount(
                sendDialog.broadcast?.target_audience || "all"
              )}{" "}
              users? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                sendDialog.broadcast && handleSend(sendDialog.broadcast)
              }
              className="bg-primary"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, id: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this broadcast? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEmailBroadcastPage;
