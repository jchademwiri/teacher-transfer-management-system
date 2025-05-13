import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, District } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDistrict, mapSchool } from '@/lib/mappers';
import { Loader2 } from 'lucide-react';

// Form schema for transfer validation
export const transferFormSchema = z.object({
  transferType: z.enum(['school', 'district']).default('district'),
  districtId: z.string().min(1, "Please select a district"),
  schoolId: z.string().optional(),
  reason: z.string().min(10, "Please provide a detailed reason for your transfer request"),
});

export type TransferFormValues = z.infer<typeof transferFormSchema>;

interface TransferFormProps {
  form: UseFormReturn<TransferFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: TransferFormValues) => void;
  watchedDistrict: string | null;
  filteredSchools: School[];
  districts: string[];
}

export function TransferForm({
  form,
  isSubmitting,
  onSubmit,
  watchedDistrict,
  filteredSchools,
  districts
}: TransferFormProps) {
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [schoolsByDistrict, setSchoolsByDistrict] = useState<{ [key: string]: School[] }>({});

  // Fetch districts from database if not provided
  useEffect(() => {
    if (allDistricts.length === 0) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const { data, error } = await supabase
            .from('districts')
            .select('*')
            .order('name');
          
          if (error) throw error;
          
          const mappedDistricts = data.map(mapDistrict);
          setAllDistricts(mappedDistricts);
        } catch (error) {
          console.error('Error fetching districts:', error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      
      fetchDistricts();
    }
  }, [allDistricts.length]);

  // Fetch schools when district changes
  useEffect(() => {
    if (!watchedDistrict) return;
    
    // If we already fetched schools for this district, don't fetch again
    if (schoolsByDistrict[watchedDistrict]) return;
    
    const fetchSchools = async () => {
      setLoadingSchools(true);
      try {
        // First, get the district_id if we have a district name
        const { data: districtData } = await supabase
          .from('districts')
          .select('id')
          .eq('name', watchedDistrict)
          .single();
        
        if (!districtData) return;
        
        // Then fetch schools by district_id
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('district_id', districtData.id)
          .order('name');
        
        if (error) throw error;
        
        const mappedSchools = data.map(mapSchool);
        setSchoolsByDistrict(prev => ({
          ...prev,
          [watchedDistrict]: mappedSchools
        }));
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoadingSchools(false);
      }
    };
    
    fetchSchools();
  }, [watchedDistrict, schoolsByDistrict]);

  // Get schools for the currently selected district
  const currentSchools = watchedDistrict && schoolsByDistrict[watchedDistrict] 
    ? schoolsByDistrict[watchedDistrict] 
    : filteredSchools;

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Submit Transfer Request</CardTitle>
        <CardDescription>
          Complete this form to request a transfer to another school or district
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="transferType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transfer Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="school" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Transfer to Specific School
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="district" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Transfer to Any School in District
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="districtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingDistricts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                        {loadingDistricts && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.name}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('transferType') === 'school' && (
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!watchedDistrict || loadingSchools}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                          {loadingSchools && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                        {currentSchools.length === 0 && !loadingSchools && (
                          <SelectItem value="none" disabled>
                            No schools available in this district
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Transfer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed reasons for your transfer request"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Transfer Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
