
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { School } from '@/types';
import { HeadmasterData } from '@/hooks/use-headmasters-data';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

// Form schema for headmaster validation
const headmasterSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  ec_number: z.string().min(3, "EC number is required"),
  email: z.string().email("Please enter a valid email address"),
  school_id: z.string().min(1, "Please select a school"),
});

export type HeadmasterFormValues = z.infer<typeof headmasterSchema>;

interface HeadmasterFormProps {
  isSubmitting: boolean;
  currentHeadmaster: HeadmasterData | null;
  allSchools: School[];
  availableSchools: School[];
  onSubmit: (values: HeadmasterFormValues) => Promise<void>;
  onCancel: () => void;
}

export function HeadmasterForm({
  isSubmitting,
  currentHeadmaster,
  allSchools,
  availableSchools,
  onSubmit,
  onCancel
}: HeadmasterFormProps) {
  const form = useForm<HeadmasterFormValues>({
    resolver: zodResolver(headmasterSchema),
    defaultValues: {
      name: '',
      ec_number: '',
      email: '',
      school_id: '',
    },
  });

  useEffect(() => {
    if (currentHeadmaster) {
      form.setValue('name', currentHeadmaster.name);
      form.setValue('ec_number', currentHeadmaster.ec_number);
      form.setValue('email', currentHeadmaster.email || '');
      form.setValue('school_id', currentHeadmaster.school_id || '');
    } else {
      form.reset();
    }
  }, [currentHeadmaster, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ec_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EC Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. EC12345" />
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
                <Input {...field} type="email" placeholder="e.g. john.doe@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="school_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned School</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Show all schools when editing, only available schools when adding */}
                  {(currentHeadmaster ? allSchools : availableSchools).map((school) => (
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
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentHeadmaster ? 'Update Headmaster' : 'Add Headmaster'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
