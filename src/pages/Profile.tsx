
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from "lucide-react";
import { User } from "@/types";

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ecNumber, setEcNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSchool, setUserSchool] = useState<any>(null);
  const [userSubjects, setUserSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserByRole = async () => {
      if (!authUser?.role) return;
      
      setLoading(true);
      try {
        // Fetch a user with the same role as the logged-in user
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', authUser.role)
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const userData = data[0];
          setUser({
            id: userData.id,
            email: userData.email || '',
            name: userData.name || userData.full_name || '',
            role: userData.role as any,
            ecNumber: '', // Will fetch this separately if needed
            schoolId: '', // Will fetch this separately if needed
            createdAt: userData.created_at,
            updatedAt: userData.updated_at || userData.created_at,
            isActive: userData.is_active,
            setupComplete: userData.setup_complete
          });
          
          setName(userData.name || userData.full_name || '');
          setEmail(userData.email || '');
          
          // If user is a teacher or headmaster, fetch additional details
          if (userData.role === 'teacher') {
            const { data: teacherData, error: teacherError } = await supabase
              .from('teachers')
              .select('*')
              .eq('user_id', userData.id)
              .single();
            
            if (!teacherError && teacherData) {
              setEcNumber(teacherData.ec_number || '');
              
              // Update user with additional info
              setUser(prev => prev ? {
                ...prev,
                ecNumber: teacherData.ec_number,
                schoolId: teacherData.school_id
              } : null);
              
              // Fetch school details
              if (teacherData.school_id) {
                const { data: schoolData } = await supabase
                  .from('schools')
                  .select('*')
                  .eq('id', teacherData.school_id)
                  .single();
                
                if (schoolData) {
                  setUserSchool(schoolData);
                }
              }
              
              // Fetch subjects
              const { data: subjectsData } = await supabase
                .from('subjects')
                .select('*')
                .limit(3); // Just get a few subjects for demonstration
              
              if (subjectsData) {
                setUserSubjects(subjectsData);
              }
            }
          } else if (userData.role === 'headmaster') {
            const { data: headmasterData, error: headmasterError } = await supabase
              .from('headmasters')
              .select('*')
              .eq('user_id', userData.id)
              .single();
            
            if (!headmasterError && headmasterData) {
              setEcNumber(headmasterData.ec_number || '');
              
              // Update user with additional info
              setUser(prev => prev ? {
                ...prev,
                ecNumber: headmasterData.ec_number,
                schoolId: headmasterData.school_id
              } : null);
              
              // Fetch school details
              if (headmasterData.school_id) {
                const { data: schoolData } = await supabase
                  .from('schools')
                  .select('*')
                  .eq('id', headmasterData.school_id)
                  .single();
                
                if (schoolData) {
                  setUserSchool(schoolData);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserByRole();
  }, [authUser?.role, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) return;

      // Update the users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: name,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (userError) throw userError;

      // If it's a teacher or headmaster, update their respective tables
      if (user.role === 'teacher') {
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            name: name,
            ec_number: ecNumber,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (teacherError) throw teacherError;
      } else if (user.role === 'headmaster') {
        const { error: headmasterError } = await supabase
          .from('headmasters')
          .update({
            name: name,
            ec_number: ecNumber,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (headmasterError) throw headmasterError;
      }
        
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      // Update local state to reflect changes
      setUser(prev => prev ? {
        ...prev,
        name: name,
        email: email,
        ecNumber: ecNumber
      } : null);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile Not Found</h1>
          <p className="text-muted-foreground">
            Could not load user profile information
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            View and update your personal information
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                {(user.role === 'teacher' || user.role === 'headmaster') && (
                  <div className="space-y-2">
                    <Label htmlFor="ecNumber">EC Number</Label>
                    <Input
                      id="ecNumber"
                      value={ecNumber}
                      onChange={(e) => setEcNumber(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Professional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Your role and credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              </div>
              
              {user.ecNumber && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">EC Number</p>
                  <p className="text-sm text-muted-foreground">{user.ecNumber}</p>
                </div>
              )}
              
              {userSchool && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">School</p>
                  <p className="text-sm text-muted-foreground">{userSchool.name}</p>
                  <p className="text-sm text-muted-foreground">{userSchool.district}</p>
                </div>
              )}
              
              {user.role === 'teacher' && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Teaching Level</p>
                  <p className="text-sm text-muted-foreground">
                    {(user as any).level || 'Not specified'}
                  </p>
                </div>
              )}
              
              {userSubjects.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Subject Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {userSubjects.map(subject => (
                      <span key={subject.id} className="text-xs bg-secondary px-2 py-1 rounded">
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
