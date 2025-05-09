
import { ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="border-b sticky top-0 z-10 bg-background flex items-center h-16 px-4">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 px-4 py-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
