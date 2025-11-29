"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronDown,
  Camera,
  FileText,
  BarChart3,
  HardDrive,
  Package,
  File,
  FileCode,
  BookOpen,
  Smartphone
} from "lucide-react";
import type { TabType } from "@/components/DesignStudioWorkspace";

// Brand Icons
const FigmaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z"
      fill="#0ACF83"
    />
    <path
      d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z"
      fill="#A259FF"
    />
    <path
      d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z"
      fill="#F24E1E"
    />
    <path
      d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z"
      fill="#FF7262"
    />
    <path
      d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z"
      fill="#1ABCFE"
    />
  </svg>
);

const WebflowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.947 9.003c-.122.513-.244 1.025-.366 1.537-.184.732-.428 1.574-.733 2.525-.184-.732-.367-1.403-.55-2.013-.245-.732-.489-1.464-.794-2.196-.245-.61-.489-1.22-.794-1.83-.245-.427-.611-.671-1.038-.732-.428-.061-.856.061-1.162.366-.306.305-.489.732-.611 1.22-.306 1.22-.611 2.44-.917 3.66-.122.488-.244.976-.367 1.464-.306-1.464-.611-2.928-.917-4.392-.244-.976-.855-1.586-1.648-1.647-.733-.061-1.343.305-1.709.976-.367.61-.611 1.281-.794 1.952-.367 1.22-.733 2.44-1.1 3.66-.245.732-.428 1.525-.672 2.318-.183.61.061 1.281.55 1.647.489.366 1.162.366 1.648.122.428-.244.672-.671.794-1.159.306-1.22.672-2.44.978-3.66.122-.488.245-.976.367-1.464.122.488.244.976.367 1.464.305 1.22.61 2.44.916 3.66.184.61.611 1.037 1.222 1.159.672.122 1.283-.122 1.648-.671.367-.61.611-1.281.794-1.952.306-1.22.672-2.44.978-3.66.122-.488.244-.976.367-1.464.122.488.244.976.366 1.464.306 1.22.611 2.44.917 3.66.184.61.611 1.037 1.222 1.159.672.122 1.283-.122 1.648-.671.367-.61.611-1.281.795-1.952.489-1.952.978-3.904 1.405-5.856.122-.61-.061-1.22-.55-1.586-.489-.366-1.162-.366-1.648-.122-.428.244-.672.671-.794 1.159-.306 1.22-.672 2.44-.978 3.66-.122.549-.244 1.098-.367 1.647z"
      fill="#4353FF"
    />
  </svg>
);

type ExportDropdownProps = {
  activeTab: TabType;
  onExport: (format: string, message: string) => void;
};

export function ExportDropdown({ activeTab, onExport }: ExportDropdownProps) {
  const handleExport = (format: string, message: string) => {
    onExport(format, message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {activeTab === "strategy" && (
          <>
            <DropdownMenuItem onClick={() => handleExport("figma-valueprop", "Exporting to Figma...")}>
              <FigmaIcon className="w-4 h-4 mr-2" />
              Export to Figma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("webflow-valueprop", "Opening in Webflow...")}>
              <WebflowIcon className="w-4 h-4 mr-2" />
              Export to Webflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("persona-png", "Exporting persona card...")}>
              <Camera className="w-4 h-4 mr-2" />
              Export Persona Card (PNG)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("markdown", "Copying messaging to clipboard...")}>
              <FileText className="w-4 h-4 mr-2" />
              Copy Messaging (Markdown)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv", "Downloading value-prop-table.csv...")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Table (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("notion", "Opening in Notion...")}>
              <FileText className="w-4 h-4 mr-2" />
              Export to Notion
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("pdf", "Exporting view as PDF...")}>
              <File className="w-4 h-4 mr-2" />
              Export View as PDF
            </DropdownMenuItem>
          </>
        )}

        {activeTab === "identity" && (
          <>
            <DropdownMenuItem onClick={() => handleExport("figma", "Opening in Figma...")}>
              <FigmaIcon className="w-4 h-4 mr-2" />
              Export to Figma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("webflow", "Opening in Webflow...")}>
              <WebflowIcon className="w-4 h-4 mr-2" />
              Export to Webflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("css", "Downloading brand-variables.css...")}>
              <HardDrive className="w-4 h-4 mr-2" />
              Download CSS Variables
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json", "Downloading design-tokens.json...")}>
              <Package className="w-4 h-4 mr-2" />
              Export JSON Tokens
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf", "Downloading brand-guide.pdf...")}>
              <File className="w-4 h-4 mr-2" />
              Export Brand PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("brand-png", "Exporting view as PNG...")}>
              <Camera className="w-4 h-4 mr-2" />
              Export View as PNG
            </DropdownMenuItem>
          </>
        )}

        {activeTab === "components" && (
          <>
            <DropdownMenuItem onClick={() => handleExport("figma-lib", "Exporting to Figma Library...")}>
              <FigmaIcon className="w-4 h-4 mr-2" />
              Export to Figma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("webflow-style", "Opening in Webflow...")}>
              <WebflowIcon className="w-4 h-4 mr-2" />
              Export to Webflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("react", "Downloading React components...")}>
              <FileCode className="w-4 h-4 mr-2" />
              Export React Components
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("storybook", "Opening in Storybook...")}>
              <BookOpen className="w-4 h-4 mr-2" />
              Export to Storybook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("tokens", "Downloading design-tokens.json...")}>
              <HardDrive className="w-4 h-4 mr-2" />
              Download Design Tokens (JSON)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("style-pdf", "Exporting view as PDF...")}>
              <File className="w-4 h-4 mr-2" />
              Export View as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("style-png", "Exporting view as PNG...")}>
              <Camera className="w-4 h-4 mr-2" />
              Export View as PNG
            </DropdownMenuItem>
          </>
        )}

        {activeTab === "previews" && (
          <>
            <DropdownMenuItem onClick={() => handleExport("figma-frame", "Copying as Figma Frame...")}>
              <FigmaIcon className="w-4 h-4 mr-2" />
              Export to Figma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("webflow-landing", "Opening in Webflow...")}>
              <WebflowIcon className="w-4 h-4 mr-2" />
              Export to Webflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("html", "Downloading landing-page.html...")}>
              <File className="w-4 h-4 mr-2" />
              Export HTML/CSS
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("mobile", "Downloading mobile-preview.png...")}>
              <Smartphone className="w-4 h-4 mr-2" />
              Export Mobile Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("landing-pdf", "Exporting view as PDF...")}>
              <File className="w-4 h-4 mr-2" />
              Export View as PDF
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

