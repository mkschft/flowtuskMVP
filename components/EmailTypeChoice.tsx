"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MailCheck,
  ArrowRight
} from "lucide-react";

type EmailType = {
  id: 'one-time' | 'sequence';
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badge?: string;
};

type EmailTypeChoiceProps = {
  onSelect: (type: 'one-time' | 'sequence') => void;
};

export function EmailTypeChoice({ onSelect }: EmailTypeChoiceProps) {
  const emailTypes: EmailType[] = [
    {
      id: 'one-time',
      title: 'Single Email',
      description: 'Perfect for announcements or quick outreach',
      icon: <Mail className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-300 dark:border-blue-700'
    },
    {
      id: 'sequence',
      title: 'Email Sequence',
      description: '5, 7, or 10-day nurture flow',
      icon: <MailCheck className="h-6 w-6" />,
      gradient: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-300 dark:border-purple-700',
      badge: 'Recommended'
    }
  ];

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
        <h3 className="font-bold text-lg">Choose Email Type</h3>
        <p className="text-sm text-muted-foreground mt-1">
          How would you like to reach your audience?
        </p>
      </div>

      {/* Choice Cards */}
      <div className="p-4 grid md:grid-cols-2 gap-4">
        {emailTypes.map((type) => (
          <Card
            key={type.id}
            className={`group relative overflow-hidden border-2 ${type.borderColor} hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300`}
            onClick={() => onSelect(type.id)}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            {/* Badge */}
            {type.badge && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                  {type.badge}
                </Badge>
              </div>
            )}
            
            <div className="relative p-4 flex items-center gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${type.bgColor} group-hover:scale-110 transition-transform`}>
                <div className={type.textColor}>
                  {type.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
                  {type.title}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-muted/30 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span>Single: Quick, direct communication</span>
          </div>
          <div className="flex items-center gap-2">
            <MailCheck className="h-3 w-3" />
            <span>Sequence: Builds relationship over time</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
