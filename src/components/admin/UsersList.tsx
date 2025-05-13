
import React from 'react';
import { UserCard } from './UserCard';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { User } from '@/types';

interface UsersListProps {
  users: User[];
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onEditUser: (user: User) => void;
}

export function UsersList({ 
  users, 
  searchQuery, 
  isLoading, 
  onSearchChange, 
  onEditUser
}: UsersListProps) {
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onEdit={onEditUser} 
              />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
