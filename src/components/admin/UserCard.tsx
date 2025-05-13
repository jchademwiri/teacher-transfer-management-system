
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  // Find the user's school name if schoolId exists
  const schoolInfo = user.schoolId ? (
    <p className="text-sm text-muted-foreground">School ID: {user.schoolId}</p>
  ) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{user.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {schoolInfo}
        </div>
      </CardContent>
    </Card>
  );
}
