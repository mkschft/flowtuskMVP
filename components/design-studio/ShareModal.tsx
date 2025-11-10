"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, Code, FileDown, Copy, Check, CheckCircle2 } from "lucide-react";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  onCopy: (message: string, type?: "success" | "info" | "download" | "link") => void;
  projectName: string;
};

export function ShareModal({ open, onClose, onCopy, projectName }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = `https://flowtusk.com/share/${projectName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    onCopy("Link copied to clipboard", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    onCopy("Embed code copied", "success");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadPDF = () => {
    onCopy("Downloading design-system.pdf...", "download");
    setTimeout(() => {
      onCopy("PDF downloaded successfully", "success");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Design System</DialogTitle>
          <DialogDescription>
            Share your design system with your team or export for presentations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-2">
              <Link className="w-4 h-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code className="w-4 h-4" />
              Embed Code
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <FileDown className="w-4 h-4" />
              Export PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shareable URL</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-xs" />
                <Button onClick={handleCopyLink} size="sm" className="gap-2">
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view your design system
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="text-sm font-semibold mb-2">What's included:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Value proposition and messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Complete brand guidelines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Style guide with components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Landing page preview
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Embed Code</label>
              <Textarea
                value={embedCode}
                readOnly
                rows={3}
                className="font-mono text-xs"
              />
              <Button onClick={handleCopyEmbed} size="sm" className="gap-2">
                {copiedEmbed ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Embed this design system in your documentation, portfolio, or website
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="text-sm font-semibold mb-2">Perfect for:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  Design system documentation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  Portfolio showcases
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  Internal wikis and handbooks
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border">
                <h4 className="text-sm font-semibold mb-2">Export as PDF</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Download a complete PDF with all design system components, perfect for presentations and stakeholder reviews.
                </p>
                <Button onClick={handleDownloadPDF} className="gap-2">
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="text-sm font-semibold mb-2">Includes:</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Cover page with branding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ICP and value proposition
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Brand colors and typography
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Component specifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Landing page mockup
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

