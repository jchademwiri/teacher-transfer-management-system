
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subject } from '@/types';
import { Filter } from 'lucide-react';

interface TeacherFiltersProps {
  subjects: Subject[];
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export function TeacherFilters({
  subjects,
  selectedSubject,
  setSelectedSubject,
  selectedLevel,
  setSelectedLevel,
  selectedStatus,
  setSelectedStatus,
}: TeacherFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <div className="flex-1 sm:flex-none">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 sm:flex-none">
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 sm:flex-none">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transfer Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="None">None</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Forwarded">Forwarded</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
