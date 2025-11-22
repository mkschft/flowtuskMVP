"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateManifestFromDesignStudio } from "@/lib/brand-manifest";
import { Copy, Check, Figma } from "lucide-react";
import { toast } from "sonner";

type ExportToFigmaButtonProps = {
    flowId: string;
    workspaceData: any;
    designAssets: any;
};

export function ExportToFigmaButton({ flowId, workspaceData, designAssets }: ExportToFigmaButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [brandKey, setBrandKey] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleExport = async () => {
        if (!workspaceData || !designAssets) {
            toast.error("Design data not ready yet");
            return;
        }

        setIsExporting(true);
        try {
            // Generate manifest
            const manifest = generateManifestFromDesignStudio(
                { id: flowId, ...workspaceData.persona }, // Mock flow object for now
                workspaceData,
                designAssets
            );

            // Save to backend
            const response = await fetch('/api/brand-manifest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flowId, manifest })
            });

            if (!response.ok) throw new Error('Failed to save manifest');

            const data = await response.json();
            setBrandKey(data.brandKey);
            setModalOpen(true);
            toast.success("Brand System generated!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const copyToClipboard = () => {
        if (!brandKey) return;
        navigator.clipboard.writeText(brandKey);
        setCopied(true);
        toast.success("Brand Key copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Button
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2 bg-[#F24E1E] hover:bg-[#D1431A] text-white" // Figma brand color
            >
                <Figma className="w-4 h-4" />
                {isExporting ? 'Generating...' : 'Export to Figma'}
            </Button>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Figma className="w-5 h-5 text-[#F24E1E]" />
                            Brand System Ready for Figma
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-6 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center">
                            <p className="text-sm text-muted-foreground mb-2">Your Brand Key</p>
                            <code className="text-2xl font-mono font-bold tracking-wider text-foreground bg-background px-4 py-2 rounded-lg border shadow-sm">
                                {brandKey}
                            </code>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-sm">How to import:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                <li>Open <strong>Figma</strong></li>
                                <li>Run the <strong>Flowtusk</strong> plugin</li>
                                <li>Select <strong>"Import from Flowtusk"</strong></li>
                                <li>Paste your Brand Key above</li>
                            </ol>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={copyToClipboard}
                                className="flex-1 gap-2"
                                variant="default"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy Brand Key'}
                            </Button>
                            <Button
                                onClick={() => window.open('https://www.figma.com/community/plugin/flowtusk', '_blank')}
                                variant="outline"
                                className="flex-1"
                            >
                                Get Plugin
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
