import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "accent";
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) {
  const variantStyles = {
    default: "bg-card border-border/50",
    primary: "gradient-primary text-primary-foreground border-transparent",
    secondary: "gradient-secondary text-secondary-foreground border-transparent",
    accent: "bg-accent border-accent",
  };

  const iconStyles = {
    default: "bg-accent text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    secondary: "bg-secondary-foreground/20 text-secondary-foreground",
    accent: "bg-primary text-primary-foreground",
  };

  const subtitleStyles = {
    default: "text-muted-foreground",
    primary: "text-primary-foreground/80",
    secondary: "text-secondary-foreground/80",
    accent: "text-muted-foreground",
  };

  return (
    <div 
      className={`stat-card relative overflow-hidden ${variantStyles[variant]} animate-scale-in`}
    >
      {variant === "secondary" && (
        <div className="absolute inset-0 shadow-glow opacity-50" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${variant !== "default" ? "" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className="text-3xl font-bold font-display tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${subtitleStyles[variant]}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
