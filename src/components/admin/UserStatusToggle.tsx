import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

interface UserStatusToggleProps {
  userId: string
  isActive: boolean
  onStatusChange?: () => void
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>
}

export function UserStatusToggle({ userId, isActive, onStatusChange, updateUserStatus }: UserStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isActive);
  const { toast } = useToast();
  const handleStatusChange = async (checked: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateUserStatus(userId, checked);
      setCurrentStatus(checked);
      if (onStatusChange) {
        onStatusChange();
      }
      toast({
        title: "Success",
        description: `User ${checked ? 'activated' : 'deactivated'} successfully`,
      });
      
      // Trigger refresh of the users list
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating user status:', error);
      // Revert the toggle if there was an error
      setCurrentStatus(isActive);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Switch
          checked={currentStatus}
          onCheckedChange={handleStatusChange}
          disabled={isUpdating}
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>      <Badge variant={currentStatus ? 'default' : 'destructive'}>
        {currentStatus ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}
