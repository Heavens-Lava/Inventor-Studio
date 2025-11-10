import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
}

const AppCard = ({ title, description, icon: Icon, route, gradient }: AppCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(route)}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-card hover:shadow-card-hover bg-gradient-card border-border/50"
    >
      <div className="p-6 space-y-4">
        <div
          className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </Card>
  );
};

export default AppCard;
