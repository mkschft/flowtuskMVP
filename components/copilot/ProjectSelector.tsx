"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectSelectorProps = {
  activeProject: "saas" | "agency";
  onProjectChange: (project: "saas" | "agency") => void;
};

export function ProjectSelector({ activeProject, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Example:</span>
        <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onProjectChange("saas")}
            className={cn(
              "gap-2 h-8",
              activeProject === "saas"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : ""
            )}
          >
            <Zap className="w-3 h-3" />
            SaaS Startup
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onProjectChange("agency")}
            className={cn(
              "gap-2 h-8",
              activeProject === "agency"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                : ""
            )}
          >
            <Briefcase className="w-3 h-3" />
            Design Agency
          </Button>
        </div>
      </div>
      <Badge variant="outline" className="ml-auto">
        Demo Mode
      </Badge>
    </div>
  );
}

