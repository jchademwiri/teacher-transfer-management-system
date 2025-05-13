
import React, { useState, useEffect } from 'react';
import MainNavigation from "@/components/MainNavigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import custom components
import { HeadmasterForm, HeadmasterFormValues } from '@/components/admin/HeadmasterForm';
import { HeadmastersTable } from '@/components/admin/HeadmastersTable';
import { HeadmastersSearch } from '@/components/admin/HeadmastersSearch';
import { useHeadmastersData, HeadmasterData } from '@/hooks/use-headmasters-data';

const HeadmastersPage = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHeadmaster, setCurrentHeadmaster] = useState<HeadmasterData | null>(null);
  const { toast } = useToast();
  
  const {
    headmasters,
    allSchools,
    availableSchools,
    isLoading,
    fetchHeadmasters,
    fetchSchools,
    handleDelete
  } = useHeadmastersData();

  useEffect(() => {
    fetchHeadmasters();
    fetchSchools();
  }, []);

  const openAddDialog = () => {
    setCurrentHeadmaster(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (headmaster: HeadmasterData) => {
    setCurrentHeadmaster(headmaster);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: HeadmasterFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentHeadmaster) {
        // Handle school reassignment if school changed
        if (currentHeadmaster.school_id !== values.school_id) {
          // Remove headmaster from old school
          await supabase
            .from('schools')
            .update({ headmaster_id: null })
            .eq('id', currentHeadmaster.school_id);
            
          // Set headmaster for new school
          await supabase
            .from('schools')
            .update({ headmaster_id: currentHeadmaster.id })
            .eq('id', values.school_id);
        }
        
        // Update existing headmaster
        const { error } = await supabase
          .from('headmasters')
          .update({
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentHeadmaster.id);

        if (error) throw error;
        
        // Update user email if changed
        if (currentHeadmaster.email !== values.email && currentHeadmaster.user_id) {
          const { error: userError } = await supabase
            .from('users')
            .update({ email: values.email })
            .eq('id', currentHeadmaster.user_id);
            
          if (userError) throw userError;
        }
        
        toast({
          title: 'Success',
          description: 'Headmaster updated successfully',
        });
      } else {
        // Create new user account
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: values.email,
          email_confirm: true,
          user_metadata: { name: values.name, role: 'headmaster' }
        });

        if (userError) throw userError;
        
        // Create headmaster record
        const { data: headmasterData, error: headmasterError } = await supabase
          .from('headmasters')
          .insert({
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
            user_id: userData.user.id
          })
          .select()
          .single();

        if (headmasterError) throw headmasterError;
        
        // Update school with headmaster_id
        const { error: schoolError } = await supabase
          .from('schools')
          .update({ headmaster_id: headmasterData.id })
          .eq('id', values.school_id);
          
        if (schoolError) throw schoolError;
        
        toast({
          title: 'Success',
          description: 'Headmaster added successfully and invitation email sent',
        });
      }

      setIsDialogOpen(false);
      fetchHeadmasters();
      fetchSchools();
    } catch (error: any) {
      console.error('Error submitting headmaster:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save headmaster. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter headmasters based on search term
  const filteredHeadmasters = headmasters.filter(headmaster => 
    headmaster.name.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.ec_number.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.email?.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.schools?.name.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.schools?.district.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Headmasters Management</h1>
          <Button onClick={openAddDialog} disabled={availableSchools.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Headmaster
          </Button>
        </div>
        
        {availableSchools.length === 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <p className="text-yellow-700">
                All schools currently have headmasters assigned. To add a new headmaster,
                first add a new school or remove an existing headmaster.
              </p>
            </CardContent>
          </Card>
        )}
        
        <HeadmastersSearch 
          search={search}
          onSearchChange={setSearch}
        />
        
        <HeadmastersTable
          headmasters={headmasters}
          filteredHeadmasters={filteredHeadmasters}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      </div>

      {/* Add/Edit Headmaster Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentHeadmaster ? 'Edit Headmaster' : 'Add New Headmaster'}</DialogTitle>
            <DialogDescription>
              {currentHeadmaster 
                ? 'Update the headmaster information below.' 
                : 'Enter the details for the new headmaster.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <HeadmasterForm
            isSubmitting={isSubmitting}
            currentHeadmaster={currentHeadmaster}
            allSchools={allSchools}
            availableSchools={availableSchools}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeadmastersPage;
