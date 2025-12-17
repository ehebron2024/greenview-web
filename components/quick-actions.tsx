import React from "react";
import {
  FolderOpen,
  Calendar,
  FileText,
  Users,
  Camera,
  ClipboardList,
} from "lucide-react";

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
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isPrimary
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
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
