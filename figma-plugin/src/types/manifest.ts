// Brand Manifest Types
// Mirrored from /lib/types/brand-manifest.ts for plugin independence

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
            primary: ColorToken[];
            secondary: ColorToken[];
            accent: ColorToken[];
            neutral: ColorToken[];
        };
        typography: {
            heading: TypographyStyle;
            body: TypographyStyle;
            code?: TypographyStyle;
        };
        logo: {
            variations: LogoVariation[];
        };
        tone: {
            keywords: string[];
            personality: PersonalityTrait[];
        };
    };

    // Components Layer
    components: {
        buttons: {
            primary: ButtonStyle;
            secondary: ButtonStyle;
            outline: ButtonStyle;
        };
        cards: CardStyle;
        inputs: InputStyle;
        spacing: {
            scale: Record<string, string>;
        };
    };

    // Previews Layer (Generated Content)
    previews: {
        landingPage: {
            hero: HeroSection;
            features: Feature[];
            socialProof: SocialProofItem[];
            footer: FooterSection;
        };
    };

    // Metadata
    metadata: {
        generationHistory: GenerationHistoryItem[];
        regenerationCount: number;
        sourceFlowId: string;
        sourceIcpId: string;
    };
}

// Supporting Types

export interface ColorToken {
    name: string;
    hex: string;
    usage?: string;
}

export interface TypographyStyle {
    family: string;
    weights: string[];
    sizes: Record<string, string>;
}

export interface LogoVariation {
    name: string;
    description: string;
}

export interface PersonalityTrait {
    trait: string;
    value: number;
    leftLabel: string;
    rightLabel: string;
}

export interface ButtonStyle {
    style: string;
    borderRadius: string;
    shadow: string;
}

export interface CardStyle {
    style: string; // "flat" | "elevated" | "bordered"
    borderRadius: string;
    shadow: string;
}

export interface InputStyle {
    style: string;
    borderRadius: string;
    focusStyle: string;
}

export interface HeroSection {
    headline: string;
    subheadline: string;
    cta: {
        primary: string;
        secondary: string;
    };
}

export interface Feature {
    title: string;
    description: string;
    icon: string;
}

export interface SocialProofItem {
    quote: string;
    author: string;
    role: string;
    company: string;
}

export interface FooterSection {
    sections: {
        title: string;
        links: string[];
    }[];
}

export interface GenerationHistoryItem {
    timestamp: string;
    action: string;
    changedFields: string[];
}

// Type Exports
export type BrandStrategy = BrandManifest['strategy'];
export type BrandIdentity = BrandManifest['identity'];
export type BrandComponents = BrandManifest['components'];
export type BrandPreviews = BrandManifest['previews'];
