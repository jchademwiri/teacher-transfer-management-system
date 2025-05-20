import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Trash } from 'lucide-react';

export interface TeacherData {
  id: string;
  name: string;
  email?: string;
  ec_number?: string;
  school?: {
    id?: string;
    name?: string;
    district?: string;
  };
}

interface TeachersTableProps {
  teachers: TeacherData[];
  filteredTeachers: TeacherData[];
  isLoading: boolean;
  onEdit: (teacher: TeacherData) => void;
  onDelete: (id: string) => void;
}

export function TeachersTable({
  teachers,
  filteredTeachers,
  isLoading,
  onEdit,
  onDelete
}: TeachersTableProps) {
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">EC Number</th>
              <th className="text-left py-3 px-4">School</th>
              <th className="text-left py-3 px-4">District</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{teacher.name}</td>
                  <td className="py-3 px-4">{teacher.ec_number}</td>
                  <td className="py-3 px-4">{teacher.school?.name}</td>
                  <td className="py-3 px-4">{teacher.school?.district}</td>
                  <td className="py-3 px-4 space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(teacher)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(teacher.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No teachers found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 