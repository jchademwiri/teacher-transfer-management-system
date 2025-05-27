import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { useUsersData } from '@/hooks/use-users-data';
import { UserTabs } from '@/components/admin/UserTabs';
import { UserFormValues } from '@/components/admin/UserFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Create admin client once, outside the component
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
            phone: values.phone,
            is_active: values.isActive,
            setup_complete: values.setupComplete,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        if (error) throw error;

        toast({
          title: 'User updated',
          description: `${values.name} has been updated successfully.`,
        });      } else {        // Use the pre-created admin client
        const adminAuthClient = adminClient.auth.admin;        try {
          // Create user with admin privileges
          const { data: userData, error: userError } = await adminAuthClient.createUser({
            email: values.email,
            password: values.password,
            email_confirm: true,
            user_metadata: { 
              name: values.name,
              role: values.role,
              ec_number: values.ecNumber,
            },
          });

          if (userError) {
            console.error("Error creating user:", userError);
            throw userError;
          }

          if (!userData?.user?.id) {
            throw new Error("User creation successful but no user ID returned");
          }

          // Create user profile in users table
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: userData.user.id,
              name: values.name,
              email: values.email,
              role: values.role,
              ec_number: values.ecNumber,
              phone: values.phone || null,
              school_id: values.schoolId || null,
              subject_id: values.subjectId || null,
              is_active: true,
              setup_complete: true,
              token_identifier: userData.user.id,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            });

          if (profileError) {
            throw profileError;
          }

          // Update user status
          const { error: updateError } = await adminAuthClient.updateUser(userData.user.id, {
            user_metadata: { 
              name: values.name,
              role: values.role,
              ec_number: values.ecNumber,
              is_active: true,
              setup_complete: true
            },
            app_metadata: { role: values.role }
          });

          if (updateError) {
            throw updateError;
          }if (profileError) {
          // If profile creation fails, we should clean up the auth user
          await adminAuthClient.deleteUser(userData.user.id);
          console.error("Error creating user profile:", profileError);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
        
        toast({
          title: 'User added',
          description: `${values.name} has been added successfully.`,
        });
      }      setIsEditing(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };
  const handleEdit = (user: User) => {
    setCurrentUser({
      ...user,
      ecNumber: user.ecNumber || '',
      phone: user.phone || '',
    });
    setIsEditing(true);
  };

  return (    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        </div>

        <UserTabs
          users={users}
          schools={schools}
          subjects={subjects}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isEditing={isEditing}
          currentUser={currentUser}
          onSearchChange={setSearchQuery}
          onEditUser={handleEdit}
          onSubmit={handleAddOrUpdateUser}
        />
      </div>
    </div>
  );
}

export default UsersPage;