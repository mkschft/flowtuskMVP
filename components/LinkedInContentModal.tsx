"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, Download, Calendar } from "lucide-react";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";

type LinkedInPost = {
  id: number;
  title: string;
  content: string;
  metrics: {
    engagement: string;
    bestTime: string;
    tags: string[];
  };
};

const linkedInPosts: LinkedInPost[] = [
  {
    id: 1,
    title: "POST 1: Problem-Statement Hook",
    content: `95% of accounting firm owners spend 15+ hours/week on admin tasks.

Here's what they're doing instead:

• Manual data entry (6 hrs/week)
• Client follow-ups (4 hrs/week)
• System integration (3 hrs/week)
• Compliance checks (2 hrs/week)

That's $2,400/month in lost productivity.

The solution? Automation that actually works.

DM me if you want to see how 500+ firms saved 40% of their admin time 👇`,
    metrics: {
      engagement: "5-8%",
      bestTime: "Tuesday, 8am ET",
      tags: ["#Accounting", "#Automation", "#CPA"],
    },
  },
  {
    id: 2,
    title: "POST 2: Case Study",
    content: `Last month, Chen & Associates automated their entire accounting workflow.

Results after 30 days:
✅ 40% reduction in admin time
✅ 30% more clients (same team size)
✅ $45K annual savings
✅ Zero manual data entry errors

The secret? They stopped treating automation as a "nice-to-have."

Here's what they did differently... [Link in comments]`,
    metrics: {
      engagement: "6-10%",
      bestTime: "Wednesday, 9am ET",
      tags: ["#CaseStudy", "#AccountingFirm", "#ROI"],
    },
  },
  {
    id: 3,
    title: "POST 3: Data-Driven Insight",
    content: `We analyzed 500 mid-sized accounting firms.

The firms that grew 30%+ in 2024 had ONE thing in common:

They automated at least 40% of their admin workflows.

Here's the breakdown:
📊 Top 25%: 60%+ automation
📊 Middle 50%: 30-40% automation
📊 Bottom 25%: <20% automation

The correlation is clear.

What's your automation percentage? 👇`,
    metrics: {
      engagement: "7-12%",
      bestTime: "Thursday, 10am ET",
      tags: ["#Data", "#Growth", "#Accounting"],
    },
  },
  {
    id: 4,
    title: "POST 4: Founder Story",
    content: `3 years ago, I was drowning in spreadsheets.

My accounting firm was growing, but I was working 70-hour weeks.

Then I realized: I wasn't scaling my BUSINESS. I was scaling my WORKLOAD.

Today, my team handles 3x the clients in half the time.

The shift? We automated everything that didn't require human judgment.

If you're still doing manual data entry in 2024, you're leaving money on the table.`,
    metrics: {
      engagement: "8-15%",
      bestTime: "Monday, 7am ET",
      tags: ["#Founder", "#Entrepreneurship", "#Scaling"],
    },
  },
  {
    id: 5,
    title: "POST 5: Quick Win",
    content: `Free automation audit for accounting firms:

Comment "AUTOMATE" and I'll send you:
• 10-point automation readiness checklist
• ROI calculator (see your potential savings)
• 3-minute demo video

Only for firms with 5-15 employees.

Limited to first 20 firms. 👇`,
    metrics: {
      engagement: "10-20%",
      bestTime: "Tuesday, 11am ET",
      tags: ["#FreeResource", "#Accounting", "#Automation"],
    },
  },
];

type LinkedInContentModalProps = {
  onClose: () => void;
};

export function LinkedInContentModal({ onClose }: LinkedInContentModalProps) {
  const [expandedPost, setExpandedPost] = useState<number>(0);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const exportAll = () => {
    const allContent = linkedInPosts
      .map((post) => {
        return `${post.title}\n\n${post.content}\n\nTags: ${post.metrics.tags.join(" ")}\nBest Time: ${post.metrics.bestTime}\n\n---\n\n`;
      })
      .join("\n");

    const blob = new Blob([allContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-posts.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">💼 LinkedIn Content Strategy</DialogTitle>
            <DialogDescription>
              5 posts generated for accounting firm owners
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {linkedInPosts.map((post, idx) => (
              <Collapsible
                key={post.id}
                open={expandedPost === idx}
                onOpenChange={() =>
                  setExpandedPost(expandedPost === idx ? -1 : idx)
                }
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-semibold text-left">{post.title}</h3>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedPost === idx ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-muted-foreground">
                            Post Content:
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copy(post.content)}
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 border">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                            {post.content}
                          </pre>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            📊 Expected Engagement:
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30">
                            {post.metrics.engagement}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Best Posting Time:
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {post.metrics.bestTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            🏷️ Tags:
                          </span>
                          {post.metrics.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={exportAll} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

