"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Clock, 
  Heart,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

type SequenceLength = {
  id: 5 | 7 | 10;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badge?: string;
  badgeColor?: string;
};

type SequenceLengthChoiceProps = {
  onSelect: (days: 5 | 7 | 10) => void;
};

export function SequenceLengthChoice({ onSelect }: SequenceLengthChoiceProps) {
  const sequenceLengths: SequenceLength[] = [
    {
      id: 5,
      title: '5 Days',
      description: 'Quick win sequence',
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-300 dark:border-orange-700'
    },
    {
      id: 7,
      title: '7 Days',
      description: 'Balanced approach',
      icon: <Clock className="h-6 w-6" />,
      gradient: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-300 dark:border-blue-700',
      badge: 'Recommended',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      id: 10,
      title: '10 Days',
      description: 'Deep relationship building',
      icon: <Heart className="h-6 w-6" />,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-300 dark:border-purple-700'
    }
  ];

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 border-b">
        <h3 className="font-bold text-lg">Choose Sequence Length</h3>
        <p className="text-sm text-muted-foreground mt-1">
          How long should your email nurture sequence be?
        </p>
      </div>

      {/* Choice Cards */}
      <div className="p-4 grid md:grid-cols-3 gap-4">
        {sequenceLengths.map((length) => (
          <Card
            key={length.id}
            className={`group relative overflow-hidden border-2 ${length.borderColor} hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300`}
            onClick={() => onSelect(length.id)}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${length.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            {/* Badge */}
            {length.badge && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className={length.badgeColor}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {length.badge}
                </Badge>
              </div>
            )}
            
            <div className="relative p-4 flex flex-col items-center text-center">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${length.bgColor} group-hover:scale-110 transition-transform mb-3`}>
                <div className={length.textColor}>
                  {length.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1 flex items-center justify-center gap-2">
                  {length.title}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {length.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-muted/30 border-t">
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <Zap className="h-3 w-3" />
            <span className="font-medium">5 Days</span>
            <span>Fast-paced</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-medium">7 Days</span>
            <span>Optimal timing</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-3 w-3" />
            <span className="font-medium">10 Days</span>
            <span>Deep nurture</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
