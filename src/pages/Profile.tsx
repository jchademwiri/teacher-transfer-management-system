import { useState } from "react";
// import MainNavigation from "@/components/MainNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SCHOOLS, MOCK_SUBJECTS } from "@/mock/data";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(""); // Example field - not in our original data model
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user's school
  const userSchool = user?.schoolId 
    ? MOCK_SCHOOLS.find(s => s.id === user.schoolId)
    : null;
    
  // Get user's subjects if they are a teacher
  const userSubjects = user?.role === 'teacher' && (user as any).subjectIds 
    ? MOCK_SUBJECTS.filter(s => (user as any).subjectIds.includes(s.id)) 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app this would update the user profile
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
                  <p className="text-xs text-muted-foreground">
                    EC Number cannot be changed
                  </p>
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
