import React from "react";
import { FolderOpen, Calendar, FileText } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface QuickActionsProps {
  actions?: QuickAction[];
  title?: string;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = "Quick Actions",
  className = "",
}) => {
  const defaultActions: QuickAction[] = [
    {
      label: "New Project",
      icon: FolderOpen,
      onClick: () => console.log("New Project clicked"),
      variant: "primary",
    },
    {
      label: "Schedule Meeting",
      icon: Calendar,
      onClick: () => console.log("Schedule Meeting clicked"),
      variant: "secondary",
    },
    {
      label: "Upload Document",
      icon: FileText,
      onClick: () => console.log("Upload Document clicked"),
      variant: "secondary",
    },
  ];

  const actionsList = actions || defaultActions;

  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm ${className}`}
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {actionsList.map((action, index) => {
            const Icon = action.icon;
            const isPrimary = action.variant === "primary";

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`w-full flex items-center gap-3 ${
                  isPrimary
                    ? ""
                    : "bg-secondary text-secondary-foreground hover:bg-muted border-2 border-border"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
