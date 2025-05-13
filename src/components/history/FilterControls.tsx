
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterControlsProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  showUnresolvedOnly?: boolean;
  setShowUnresolvedOnly?: (value: boolean) => void;
  statusOptions: Array<{ value: string, label: string }>;
}

export function FilterControls({
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  showUnresolvedOnly,
  setShowUnresolvedOnly,
  statusOptions
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm">Filter by status:</span>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">Sort by:</span>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {setShowUnresolvedOnly && (
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant={showUnresolvedOnly ? "default" : "outline"}
            onClick={() => setShowUnresolvedOnly(!showUnresolvedOnly)}
          >
            {showUnresolvedOnly ? "Showing Unresolved Only" : "Show All Requests"}
          </Button>
        </div>
      )}
    </div>
  );
}
