
import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  className?: string;
  value?: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  children?: ReactNode;
}

export function DashboardCard({ 
  title, 
  icon, 
  className, 
  value, 
  description, 
  linkText, 
  linkHref,
  children 
}: DashboardCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {children || (
          <div className="space-y-2">
            {value && <p className="text-2xl font-bold">{value}</p>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {linkText && linkHref && (
              <Link 
                to={linkHref} 
                className="flex items-center text-xs text-primary hover:underline mt-2"
              >
                {linkText}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
