import { Shield, Users, GraduationCap, UserCheck, Plane, BookOpen, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAdminPanel } from '../hooks/useAdminPanel';
import type { User, UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

interface AdminPanelProps {
  onNavigateToManage?: () => void;
}

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
  if (role === 'admin') return 'default';
  if (role === 'user') return 'secondary';
  return 'outline';
}

function truncatePrincipal(principal: Principal): string {
  const str = principal.toString();
  if (str.length <= 20) return str;
  return `${str.slice(0, 10)}...${str.slice(-6)}`;
}

export default function AdminPanel({ onNavigateToManage }: AdminPanelProps) {
  const { isAdmin, users, usersLoading, entityCounts, updateUserRole } = useAdminPanel();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view the Admin Panel.</p>
      </div>
    );
  }

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ id: user.principal, newRole: newRole as UserRole });
      toast.success(`Role updated to "${newRole}" for ${user.name}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update role');
    }
  };

  const statCards = [
    {
      title: 'Students',
      count: entityCounts.students,
      icon: GraduationCap,
      color: 'text-blue-500',
    },
    {
      title: 'Instructors',
      count: entityCounts.instructors,
      icon: UserCheck,
      color: 'text-green-500',
    },
    {
      title: 'Aircraft',
      count: entityCounts.aircraft,
      icon: Plane,
      color: 'text-amber-500',
    },
    {
      title: 'Exercises',
      count: entityCounts.exercises,
      icon: BookOpen,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage users, roles, and system data</p>
        </div>
      </div>

      {/* System Overview */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-foreground">System Overview</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map(({ title, count, icon: Icon, color }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {(['Students', 'Instructors', 'Aircraft', 'Exercises'] as const).map((label) => (
            <Button
              key={label}
              variant="outline"
              onClick={() => onNavigateToManage?.()}
              className="gap-2"
            >
              {label === 'Students' && <GraduationCap className="h-4 w-4" />}
              {label === 'Instructors' && <UserCheck className="h-4 w-4" />}
              {label === 'Aircraft' && <Plane className="h-4 w-4" />}
              {label === 'Exercises' && <BookOpen className="h-4 w-4" />}
              Manage {label}
            </Button>
          ))}
        </div>
      </section>

      {/* User Management */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
        </div>

        <Card>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No registered users found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-44">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.principal.toString()}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {truncatePrincipal(user.principal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(user.role as string)}>
                          {(user.role as string).charAt(0).toUpperCase() + (user.role as string).slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role as string}
                          onValueChange={(val) => handleRoleChange(user, val)}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="h-8 w-36">
                            {updateUserRole.isPending ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving…
                              </span>
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
