import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Shield, ShieldOff, Users, Loader2, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: 'grant' | 'revoke';
    email: string;
  }>({ open: false, userId: '', action: 'grant', email: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantAdmin = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: 'admin' },
          { onConflict: 'user_id,role' }
        );

      if (error) throw error;

      toast.success('Admin role granted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error granting admin:', error);
      toast.error('Failed to grant admin role');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, userId: '', action: 'grant', email: '' });
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success('Admin role revoked successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin:', error);
      toast.error('Failed to revoke admin role');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, userId: '', action: 'revoke', email: '' });
    }
  };

  const openConfirmDialog = (userId: string, action: 'grant' | 'revoke', email: string) => {
    setConfirmDialog({ open: true, userId, action, email });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'grant') {
      handleGrantAdmin(confirmDialog.userId);
    } else {
      handleRevokeAdmin(confirmDialog.userId);
    }
  };

  const getRoleBadges = (roles: string[]) => {
    if (roles.length === 0) {
      return <Badge variant="secondary">User</Badge>;
    }
    return roles.map(role => (
      <Badge 
        key={role} 
        variant={role === 'admin' ? 'destructive' : role === 'moderator' ? 'default' : 'secondary'}
        className="mr-1"
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">User Management</h2>
          <Badge variant="outline" className="ml-2">
            {users.length} users
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => {
                const isAdmin = user.roles.includes('admin');
                const isLoadingAction = actionLoading === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || '—'}</TableCell>
                    <TableCell>{getRoleBadges(user.roles)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmDialog(user.id, 'revoke', user.email)}
                          disabled={isLoadingAction}
                          className="text-destructive hover:text-destructive"
                        >
                          {isLoadingAction ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Revoke Admin
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmDialog(user.id, 'grant', user.email)}
                          disabled={isLoadingAction}
                        >
                          {isLoadingAction ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              Grant Admin
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'grant' ? 'Grant Admin Access' : 'Revoke Admin Access'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'grant' 
                ? `Are you sure you want to grant admin access to ${confirmDialog.email}? They will have full administrative privileges.`
                : `Are you sure you want to revoke admin access from ${confirmDialog.email}? They will lose all administrative privileges.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={confirmDialog.action === 'revoke' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog.action === 'grant' ? 'Grant Admin' : 'Revoke Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagementTab;
