
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface HeadmastersSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function HeadmastersSearch({ search, onSearchChange }: HeadmastersSearchProps) {
  return (
    <Card className="shadow-sm mb-6">
      <CardHeader>
        <CardTitle>Search Headmasters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, EC number, email, or school..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </CardContent>
    </Card>
  );
}
