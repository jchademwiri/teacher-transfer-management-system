
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Trash } from 'lucide-react';
import { HeadmasterData } from '@/hooks/use-headmasters-data';

interface HeadmastersTableProps {
  headmasters: HeadmasterData[];
  filteredHeadmasters: HeadmasterData[];
  isLoading: boolean;
  onEdit: (headmaster: HeadmasterData) => void;
  onDelete: (id: string, schoolId: string) => void;
}

export function HeadmastersTable({
  headmasters,
  filteredHeadmasters,
  isLoading,
  onEdit,
  onDelete
}: HeadmastersTableProps) {
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
            {filteredHeadmasters.length > 0 ? (
              filteredHeadmasters.map((headmaster) => (
                <tr key={headmaster.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{headmaster.name}</td>
                  <td className="py-3 px-4">{headmaster.ec_number}</td>
                  <td className="py-3 px-4">{headmaster.schools?.name}</td>
                  <td className="py-3 px-4">{headmaster.schools?.district}</td>
                  <td className="py-3 px-4 space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(headmaster)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(headmaster.id, headmaster.school_id || '')}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No headmasters found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
