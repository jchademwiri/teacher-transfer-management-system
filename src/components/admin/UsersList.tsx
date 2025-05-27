import React from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Edit } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { User } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserStatusToggle } from './UserStatusToggle';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUsersData } from '@/hooks/use-users-data';

interface UsersListProps {
  users: User[];
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onEditUser: (user: User) => void;
  fetchUsers: () => void;
}

export function UsersList({ 
  users, 
  searchQuery, 
  isLoading, 
  onSearchChange, 
  onEditUser,
  fetchUsers
}: UsersListProps) {
  const { toast } = useToast();
  const { updateUserStatus } = useUsersData();

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.ecNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };  // Get updateUserStatus from the hook

  const handleStatusChange = async (userId: string, checked: boolean) => {
    try {
      await updateUserStatus(userId, checked);
      // The hook takes care of optimistic updates and error handling
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, EC number..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} users found
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>EC Number</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>                    <TableCell>{user.ecNumber || '-'}</TableCell>
                    <TableCell>{user.schoolId ? 'School ' + user.schoolId : '-'}</TableCell>                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UserStatusToggle
                          userId={user.id}
                          isActive={user.isActive || false}
                          onStatusChange={fetchUsers}
                          updateUserStatus={updateUserStatus}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
