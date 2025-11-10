"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Layout, 
  Square, 
  FormInput,
  Ruler,
  Circle,
  Layers
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";

type StyleGuideCanvasProps = {
  project: DesignProject;
};

export function StyleGuideCanvas({ project }: StyleGuideCanvasProps) {
  const { styleGuide } = project;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Buttons */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Square className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Buttons</h3>
        </div>

        <div className="space-y-4">
          {styleGuide.buttons.map((btn, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div className="flex-1">
                <p className="font-semibold text-sm">{btn.variant}</p>
                <p className="text-xs text-muted-foreground">{btn.description}</p>
              </div>
              <div className="flex gap-2">
                {btn.variant === "Primary" && (
                  <Button>Primary Button</Button>
                )}
                {btn.variant === "Secondary" && (
                  <Button variant="secondary">Secondary Button</Button>
                )}
                {btn.variant === "Outline" && (
                  <Button variant="outline">Outline Button</Button>
                )}
                {btn.variant === "Ghost" && (
                  <Button variant="ghost">Ghost Button</Button>
                )}
                {btn.variant === "Destructive" && (
                  <Button variant="destructive">Destructive Button</Button>
                )}
                {btn.variant === "Dark" && (
                  <Button variant="default" className="bg-slate-900 text-white hover:bg-slate-800">
                    Dark Button
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cards */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Cards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {styleGuide.cards.map((card, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm font-semibold">{card.variant}</p>
              <Card className={
                card.variant === "Elevated" 
                  ? "p-4 shadow-lg" 
                  : card.variant === "Outlined"
                  ? "p-4 border-2"
                  : card.variant === "Interactive"
                  ? "p-4 cursor-pointer hover:shadow-md transition-shadow"
                  : card.variant === "Dark Glass"
                  ? "p-4 bg-slate-900/50 backdrop-blur border-slate-700"
                  : "p-4"
              }>
                <p className="text-xs text-muted-foreground mb-2">{card.description}</p>
                <div className="h-12 bg-muted/50 rounded" />
              </Card>
            </div>
          ))}
        </div>
      </Card>

      {/* Form Elements */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <FormInput className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Form Elements</h3>
        </div>

        <div className="space-y-6">
          {styleGuide.formElements.map((element, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{element.element}</p>
                <Badge variant="outline" className="text-xs">
                  {element.description}
                </Badge>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/30 border">
                {element.element === "Text Input" && (
                  <Input placeholder="Enter text..." />
                )}
                {element.element === "Textarea" && (
                  <Textarea placeholder="Enter multiple lines..." rows={3} />
                )}
                {element.element === "Select Dropdown" && (
                  <select className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option>Choose an option...</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                )}
                {element.element === "Checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox id={`check-${idx}`} />
                    <label htmlFor={`check-${idx}`} className="text-sm">
                      Checkbox label
                    </label>
                  </div>
                )}
                {element.element === "Radio Button" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="radio" name={`radio-${idx}`} id={`radio-1-${idx}`} />
                      <label htmlFor={`radio-1-${idx}`} className="text-sm">
                        Radio option 1
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name={`radio-${idx}`} id={`radio-2-${idx}`} />
                      <label htmlFor={`radio-2-${idx}`} className="text-sm">
                        Radio option 2
                      </label>
                    </div>
                  </div>
                )}
                {element.element === "Toggle Switch" && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="toggle" />
                    <label className="text-sm">Toggle switch</label>
                  </div>
                )}
                {element.element === "Select" && (
                  <select className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option>Select option...</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Spacing System */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Ruler className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Spacing Scale</h3>
        </div>

        <div className="space-y-3">
          {styleGuide.spacing.map((space, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-16 text-right">
                <span className="font-mono text-xs font-semibold">{space.name}</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="bg-purple-500 rounded"
                  style={{
                    width: space.value,
                    height: "24px",
                  }}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {space.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Border Radius */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Circle className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Border Radius</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {styleGuide.borderRadius.map((radius, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div
                className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 mx-auto"
                style={{ borderRadius: radius.value }}
              />
              <p className="font-mono text-xs font-semibold">{radius.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{radius.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Shadows */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Shadow System</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {styleGuide.shadows.map((shadow, idx) => (
            <div key={idx} className="space-y-2">
              <p className="font-mono text-xs font-semibold">{shadow.name}</p>
              <div
                className="h-24 bg-background rounded-lg border"
                style={{ boxShadow: shadow.value }}
              />
              <p className="font-mono text-xs text-muted-foreground truncate">
                {shadow.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

