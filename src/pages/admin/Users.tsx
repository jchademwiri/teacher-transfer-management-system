import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { PlusCircle } from 'lucide-react';
import { useUsersData } from '@/hooks/use-users-data';
import { UsersList } from '@/components/admin/UsersList';
import { UserForm } from '@/components/admin/UserForm';
import { UserFormValues } from '@/components/admin/UserFormSchema';
import { supabase } from '@/integrations/supabase/client';

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const { 
    users, 
    schools, 
    subjects, 
    isLoading, 
    fetchUsers 
  } = useUsersData();

  const handleAddOrUpdateUser = async (values: UserFormValues) => {
    try {
      if (isEditing && currentUser) {
        const { error } = await supabase
          .from('users')
          .update({
            name: values.name,
            email: values.email,
            role: values.role,
            school_id: values.schoolId || null,
            subject_id: values.subjectId || null,
            ec_number: values.ecNumber,
            is_active: values.isActive,
            setup_complete: values.setupComplete,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        if (error) throw error;

        toast({
          title: 'User updated',
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        // Call the Edge Function to create the user
        const response = await fetch("/functions/v1/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // In production, use a secure way to inject the admin secret
            "Authorization": `Bearer ${import.meta.env.VITE_ADMIN_SECRET}`,
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            name: values.name,
            role: values.role,
            ec_number: values.ecNumber,
            school_id: values.schoolId || null,
            subject_id: values.subjectId || null,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to create user");
        toast({
          title: 'User added',
          description: `${values.name} has been added successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <UsersList
          users={users}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onEditUser={handleEdit}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the user information below.' : 'Add a new user to the system.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              isEditing={isEditing}
              currentUser={currentUser}
              schools={schools}
              subjects={subjects}
              onSubmit={handleAddOrUpdateUser}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default UsersPage;
