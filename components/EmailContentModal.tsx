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
import { Copy, Check, ChevronDown, Download } from "lucide-react";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";

type EmailSequence = {
  id: number;
  title: string;
  subject: string;
  body: string;
  metrics: {
    responseRate: string;
    bestTime: string;
  };
};

const emailSequences: EmailSequence[] = [
  {
    id: 1,
    title: "SEQUENCE 1: Cold Outreach",
    subject: "3 ways accounting firms cut admin 40%",
    body: `Hi Sarah,

I noticed Chen & Associates has grown to 12 employees - congrats! Most firms your size spend 15+ hours/week on manual data entry.

We help accounting firms like yours automate workflows and reclaim 40% of that time.

Worth a 15-min chat?

Best,
[Your Name]`,
    metrics: {
      responseRate: "8-12%",
      bestTime: "Tue-Thu, 9am",
    },
  },
  {
    id: 2,
    title: "SEQUENCE 2: Follow-up",
    subject: "Quick follow-up - automation demo",
    body: `Hi Sarah,

Following up on my previous email about workflow automation.

I wanted to share a quick case study: Chen & Associates (similar firm size) saved 40% on admin costs in 30 days.

Would you like to see how? I can send a 3-min demo video.

Best,
[Your Name]`,
    metrics: {
      responseRate: "15-20%",
      bestTime: "Wed-Thu, 2pm",
    },
  },
  {
    id: 3,
    title: "SEQUENCE 3: Case Study",
    subject: "How [Similar Firm] saved $45K annually",
    body: `Hi Sarah,

Quick question: How much time does your team spend on manual data entry each week?

We recently helped a 12-person accounting firm (similar to Chen & Associates) automate their workflows and save $45K annually.

They now handle 30% more clients without hiring.

Want to see how they did it?

Best,
[Your Name]`,
    metrics: {
      responseRate: "10-15%",
      bestTime: "Tue, 10am",
    },
  },
];

type EmailContentModalProps = {
  onClose: () => void;
};

export function EmailContentModal({ onClose }: EmailContentModalProps) {
  const [expandedSequence, setExpandedSequence] = useState<number>(0);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const downloadAll = () => {
    const csvContent = emailSequences
      .map((seq) => {
        return `"${seq.title}","${seq.subject}","${seq.body.replace(/"/g, '""')}","${seq.metrics.responseRate}","${seq.metrics.bestTime}"`;
      })
      .join("\n");

    const header = "Title,Subject,Body,Response Rate,Best Time\n";
    const blob = new Blob([header + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-sequences.csv";
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
            <DialogTitle className="text-2xl">📧 Email Outreach Sequences</DialogTitle>
            <DialogDescription>
              3 sequences generated for Sarah Chen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {emailSequences.map((seq, idx) => (
              <Collapsible
                key={seq.id}
                open={expandedSequence === idx}
                onOpenChange={() =>
                  setExpandedSequence(expandedSequence === idx ? -1 : idx)
                }
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-semibold text-left">{seq.title}</h3>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedSequence === idx ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          Subject:
                        </p>
                        <p className="text-sm font-medium">{seq.subject}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-muted-foreground">
                            Email Body:
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copy(`Subject: ${seq.subject}\n\n${seq.body}`)}
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
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {seq.body}
                          </pre>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">
                            Expected Response Rate:{" "}
                          </span>
                          <span className="font-semibold text-green-600">
                            {seq.metrics.responseRate}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Best Sending Time:{" "}
                          </span>
                          <span className="font-semibold text-blue-600">
                            {seq.metrics.bestTime}
                          </span>
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
            <Button onClick={downloadAll} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Download className="w-4 h-4 mr-2" />
              Download All CSV
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

