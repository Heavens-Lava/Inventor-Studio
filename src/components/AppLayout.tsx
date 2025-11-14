import { ReactNode, CSSProperties } from "react";
import AppHeader from "@/components/AppHeader";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  title: string;
  children: ReactNode;
  backgroundGradient?: string;
  containerClassName?: string;
  className?: string;
  style?: CSSProperties;
}

const BACKGROUND_GRADIENTS: Record<string, string> = {
  default: "",
  "gradient-blue":
    "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
  "gradient-purple":
    "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900",
  "gradient-green":
    "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900",
  "gradient-orange":
    "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
  "gradient-pink":
    "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900",
};

/**
 * AppLayout - A reusable layout component for all apps in Inventor Studio
 *
 * This component provides:
 * - Consistent header with gamification features (level, XP, achievements)
 * - Standardized page structure
 * - Optional background gradients
 * - Responsive container
 *
 * @param title - The title to display in the AppHeader
 * @param children - The main content of the app
 * @param backgroundGradient - Optional gradient key (default, gradient-blue, gradient-purple, etc.)
 * @param containerClassName - Optional additional classes for the container
 * @param className - Optional additional classes for the main wrapper
 * @param style - Optional inline styles for the main wrapper (e.g., custom background images)
 */
const AppLayout = ({
  title,
  children,
  backgroundGradient = "default",
  containerClassName,
  className,
  style,
}: AppLayoutProps) => {
  const gradientClass = BACKGROUND_GRADIENTS[backgroundGradient] || "";

  return (
    <div className={cn("min-h-screen bg-background", gradientClass, className)} style={style}>
      <AppHeader title={title} />
      <div className={cn("container mx-auto px-4 py-8", containerClassName)}>
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
