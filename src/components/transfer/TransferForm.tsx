
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { School } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const transferFormSchema = z.object({
  preferredDistrict: z.string().min(1, "Please select a preferred district"),
  preferredSchool: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
});

export type TransferFormValues = z.infer<typeof transferFormSchema>;

interface TransferFormProps {
  form: UseFormReturn<TransferFormValues>;
  districts: string[];
  filteredSchools: School[];
  watchedDistrict: string;
  isSubmitting: boolean;
  onSubmit: (values: TransferFormValues) => Promise<void>;
}

export const TransferForm = ({
  form,
  districts,
  filteredSchools,
  watchedDistrict,
  isSubmitting,
  onSubmit
}: TransferFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Transfer Request</CardTitle>
        <CardDescription>
          Fill in the details to request a transfer to another district or school
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="preferredDistrict"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred District</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchedDistrict && filteredSchools.length > 0 && (
              <FormField
                control={form.control}
                name="preferredSchool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred School (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSchools.map(school => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {watchedDistrict && filteredSchools.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No schools found in this district. You can still request a transfer to the district.
              </div>
            )}
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Transfer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you are requesting a transfer (minimum 10 characters)"
                      rows={5}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export { transferFormSchema };
