
import React from "react";
import { FileCheck } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { Subject } from "@/types";

interface TeachingInfoCardProps {
  ecNumber?: string;
  level?: string;
  subjects: Subject[];
}

export function TeachingInfoCard({ ecNumber, level, subjects }: TeachingInfoCardProps) {
  return (
    <DashboardCard
      title="Teaching Information"
      icon={<FileCheck className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium">EC Number</p>
          <p className="text-sm text-muted-foreground">{ecNumber || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Teaching Level</p>
          <p className="text-sm text-muted-foreground">{level || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Subjects</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {subjects.map(subject => (
              <span key={subject.id} className="text-xs bg-secondary px-2 py-1 rounded">
                {subject.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
