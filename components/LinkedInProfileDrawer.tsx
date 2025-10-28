"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Building, MapPin, Calendar, ExternalLink, TrendingUp, MessageSquare, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type LinkedInPost = {
  id: string;
  content: string;
  timestamp: string;
  engagement: number;
};

type LinkedInProfile = {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  photoUrl: string;
  matchScore: number;
  matchReasons: string[];
  recentPosts: LinkedInPost[];
  experience: {
    title: string;
    company: string;
    duration: string;
  }[];
};

type ICP = {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
  personaName: string;
  personaRole: string;
  personaCompany: string;
};

type LinkedInProfileDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icp: ICP | null;
  profiles: LinkedInProfile[];
  loading: boolean;
};

function ProfileCard({ profile }: { profile: LinkedInProfile }) {
  const [showPosts, setShowPosts] = useState(false);
  const [showExperience, setShowExperience] = useState(false);

  // Determine color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-gradient-to-r from-pink-500 to-purple-500', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' };
    if (score >= 85) return { bg: 'bg-gradient-to-r from-purple-500 to-blue-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' };
    return { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
  };

  const colors = getScoreColor(profile.matchScore);

  return (
    <Card className={`p-4 border-2 ${colors.border} hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img 
            src={profile.photoUrl}
            alt={profile.name}
            className={`w-14 h-14 rounded-xl ring-2 ${colors.border} ring-offset-2 ring-offset-background`}
          />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm truncate">{profile.name}</h4>
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className={`w-10 h-10 rounded-full ${colors.badge} flex items-center justify-center border-2 ${colors.border}`}>
                <span className="text-xs font-bold">{profile.matchScore}%</span>
              </div>
              <span className="text-[8px] text-muted-foreground font-medium">MATCH</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {profile.headline}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{profile.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{profile.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Reasons */}
      <div className="mb-3 p-2 bg-muted/50 rounded-lg">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Why this profile matches:</p>
        <div className="space-y-1">
          {profile.matchReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-xs">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {profile.recentPosts.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowPosts(!showPosts)}
            className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <span className="text-xs font-medium flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" />
              Recent Posts ({profile.recentPosts.length})
            </span>
            {showPosts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showPosts && (
            <div className="mt-2 space-y-2">
              {profile.recentPosts.map((post) => (
                <div key={post.id} className="p-2 bg-muted/30 rounded border text-xs space-y-1">
                  <p className="line-clamp-3">{post.content}</p>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.engagement}
                    </span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      <div className="mb-3">
        <button
          onClick={() => setShowExperience(!showExperience)}
          className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <span className="text-xs font-medium flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Experience ({profile.experience.length})
          </span>
          {showExperience ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showExperience && (
          <div className="mt-2 space-y-2">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="p-2 bg-muted/30 rounded border text-xs">
                <p className="font-medium">{exp.title}</p>
                <p className="text-muted-foreground">{exp.company} • {exp.duration}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View on LinkedIn */}
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full h-8 text-xs"
        onClick={() => window.open('https://linkedin.com', '_blank')}
      >
        <ExternalLink className="h-3 w-3 mr-1.5" />
        View on LinkedIn
      </Button>
    </Card>
  );
}

export function LinkedInProfileDrawer({ open, onOpenChange, icp, profiles, loading }: LinkedInProfileDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              LinkedIn Profiles Matching: {icp?.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {icp?.personaName} • {icp?.personaRole}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Finding matching profiles...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No profiles found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{profiles.length} profiles</span> matching your ICP
                </p>
                <Badge variant="outline" className="text-xs">
                  Mock Data
                </Badge>
              </div>
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

