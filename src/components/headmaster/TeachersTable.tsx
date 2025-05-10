
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TeacherWithTransferStatus } from '@/hooks/use-headmaster-teachers';

interface TeachersTableProps {
  teachers: TeacherWithTransferStatus[];
  onTeacherClick: (teacherId: string) => void;
}

export function TeachersTable({ teachers, onTeacherClick }: TeachersTableProps) {
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Forwarded':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>EC Number</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Transfer Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No teachers found matching the filters
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher) => (
              <TableRow 
                key={teacher.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTeacherClick(teacher.id)}
              >
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.ecNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjectNames.map((subject, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-blue-50"
                      >
                        {subject}
                      </Badge>
                    ))}
                    {teacher.subjectNames.length === 0 && (
                      <span className="text-muted-foreground text-sm">None assigned</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-50">
                    {teacher.level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeVariant(teacher.transferStatus)}>
                    {teacher.transferStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
