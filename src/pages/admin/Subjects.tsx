import React, { useState, useEffect } from 'react';
import MainNavigation from "@/components/MainNavigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types';
import { mapSubject } from '@/lib/mappers';
import { Edit, PlusCircle, Loader2, Search, BookOpen } from 'lucide-react';

// Form schema for subject
const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  level: z.string().min(1, 'Level is required'),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      level: 'all',
    },
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Reset form when dialog is opened for adding a new subject
    if (!isEditing && isDialogOpen) {
      form.reset({
        name: '',
        level: 'all',
      });
    }
    // Set form values when editing an existing subject
    else if (isEditing && currentSubject) {
      form.setValue('name', currentSubject.name);
      form.setValue('level', currentSubject.level);
    }
  }, [isDialogOpen, isEditing, currentSubject, form]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedSubjects = data.map(mapSubject);
        setSubjects(mappedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subjects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateSubject = async (values: SubjectFormValues) => {
    try {
      if (isEditing && currentSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: values.name,
            level: values.level,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSubject.id);

        if (error) throw error;

        toast({
          title: 'Subject updated',
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({
            name: values.name,
            level: values.level,
          });

        if (error) throw error;

        toast({
          title: 'Subject added',
          description: `${values.name} has been added successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subject',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredSubjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((subject) => (
                  <Card key={subject.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{subject.level}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No subjects found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the subject information below.' : 'Add a new subject to the system.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddOrUpdateSubject)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter subject name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? 'Update Subject' : 'Add Subject'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubjectsPage;
