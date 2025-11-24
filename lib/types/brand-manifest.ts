export interface BrandManifest {
    // Metadata
    version: "1.0";
    brandName: string;
    brandKey: string; // e.g., "ACME-X7Y9" for Figma plugin
    lastUpdated: string; // ISO timestamp

    // Strategy Layer
    strategy: {
        persona: {
            name: string;
            role: string;
            company: string;
            industry: string;
            location: string;
            country: string;
            painPoints: string[];
            goals: string[];
        };
        valueProp: {
            headline: string;
            subheadline: string;
            problem: string;
            solution: string;
            outcome: string;
            benefits: string[];
            targetAudience: string;
        };
    };

    // Identity Layer
    identity: {
        colors: {
            primary: { name: string; hex: string; usage: string }[];
            secondary: { name: string; hex: string }[];
            accent: { name: string; hex: string }[];
            neutral: { name: string; hex: string }[];
        };
        typography: {
            heading: { family: string; weights: string[]; sizes: Record<string, string> };
            body: { family: string; weights: string[]; sizes: Record<string, string> };
            code?: { family: string; weights: string[]; sizes: Record<string, string> };
        };
        logo: {
            variations: { name: string; description: string; imageUrl?: string; imageUrlSvg?: string; imageUrlStockimg?: string }[];
        };
        tone: {
            keywords: string[]; // e.g., ["Confident", "Innovative", "Clear"]
            personality: { trait: string; value: number; leftLabel: string; rightLabel: string }[];
        };
    };

    // Components Layer
    components: {
        buttons: {
            primary: { style: string; borderRadius: string; shadow: string };
            secondary: { style: string; borderRadius: string; shadow: string };
            outline: { style: string; borderRadius: string; shadow: string };
        };
        cards: {
            style: string; // "flat" | "elevated" | "bordered"
            borderRadius: string;
            shadow: string;
        };
        inputs: {
            style: string;
            borderRadius: string;
            focusStyle: string;
        };
        spacing: {
            scale: Record<string, string>; // e.g., { "xs": "4px", "sm": "8px", ... }
        };
    };

    // Previews Layer (Generated Content)
    previews: {
        landingPage: {
            navigation: { logo: string; links: string[] };
            hero: { headline: string; subheadline: string; cta: { primary: string; secondary: string } };
            features: { title: string; description: string; icon: string }[];
            socialProof: { quote: string; author: string; role: string; company: string }[];
            footer: { sections: { title: string; links: string[] }[] };
        };
    };

    // Metadata
    metadata: {
        generationHistory: {
            timestamp: string;
            action: string; // e.g., "color_update", "market_shift", "initial_generation"
            changedFields: string[];
        }[];
        regenerationCount: number;
        logoGenerationCount?: number; // Track logo generation iterations (max 2 per ICP)
        sourceFlowId: string;
        sourceIcpId: string;
    };
}

export type BrandStrategy = BrandManifest['strategy'];
export type BrandIdentity = BrandManifest['identity'];
export type BrandComponents = BrandManifest['components'];
export type BrandPreviews = BrandManifest['previews'];
