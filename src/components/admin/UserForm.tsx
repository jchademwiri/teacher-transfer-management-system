import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { School, Subject, User } from '@/types';
import { userSchema, USER_ROLES, UserFormValues } from './UserFormSchema';

interface UserFormProps {
  isEditing: boolean;
  currentUser: User | null;
  schools: School[];
  subjects: Subject[];
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserForm({ 
  isEditing, 
  currentUser, 
  schools, 
  subjects, 
  onSubmit 
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      schoolId: '',
      subjectId: '',
      ecNumber: '',
      phone: '',
      isActive: true,
      setupComplete: false,
    },
  });

  useEffect(() => {
    if (!isEditing && !currentUser) {
      form.reset();
    } else if (isEditing && currentUser) {
      form.reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || 'teacher',
        schoolId: currentUser.schoolId || '',
        subjectId: currentUser.subjectId || '',
        ecNumber: currentUser.ecNumber || '',
        phone: currentUser.phone || '',
        isActive: currentUser.isActive ?? true,
        setupComplete: currentUser.setupComplete ?? false,
      });
    }
  }, [isEditing, currentUser, form]);

  const role = form.watch('role');
  const showSchoolFields = role === 'teacher' || role === 'headmaster';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ecNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EC Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter EC number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* School Information - Only show for teachers and headmasters */}
        {showSchoolFields && (
          <div className="grid grid-cols-2 gap-6 pt-6 border-t">
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} ({school.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === 'teacher' && (
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[120px]"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export type { UserFormValues } from './UserFormSchema';
