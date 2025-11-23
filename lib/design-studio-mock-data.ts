// Mock data for Design Studio Workspace

export type ChatMessage = {
  role: "ai" | "user";
  content: string;
  timestamp?: string;
};

export type ColorScheme = {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
};

export type Typography = {
  category: "heading" | "body" | "code";
  fontFamily: string;
  sizes: { name: string; size: string; weight: string }[] | Record<string, string>;
  weights?: string[]; // Optional array of font weights (e.g., ["400", "600", "700"])
};

export type ValueProp = {
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  outcome: string;
  benefits: string[];
  targetAudience: string;
  ctaSuggestions: string[];
};

export type BrandGuide = {
  colors: {
    primary: ColorScheme[];
    secondary: ColorScheme[];
    accent: ColorScheme[];
    neutral: ColorScheme[];
  };
  typography: Typography[];
  logoVariations: { name: string; description: string }[];
  toneOfVoice: string[];
  personalityTraits: { id: string; label: string; value: number; leftLabel: string; rightLabel: string }[];
};

export type StyleGuide = {
  buttons: { variant: string; description: string }[];
  cards: { variant: string; description: string }[];
  formElements: { element: string; description: string }[];
  spacing: { name: string; value: string }[];
  borderRadius: { name: string; value: string }[];
  shadows: { name: string; value: string }[];
};

export type LandingPage = {
  navigation: { logo: string; links: string[] };
  hero: {
    headline: string;
    subheadline: string;
    cta: { primary: string; secondary: string };
  };
  features: { title: string; description: string; icon: string }[];
  socialProof: { type: string; content: string }[];
  pricing?: { tier: string; price: string; features: string[] }[];
  footer: { sections: { title: string; links: string[] }[] };
};

export type DesignProject = {
  id: string;
  name: string;
  type: "saas" | "agency";
  description: string;
  chatHistory: ChatMessage[];
  valueProp: ValueProp;
  brandGuide: BrandGuide;
  styleGuide: StyleGuide;
  landingPage: LandingPage;
};

// SaaS Project: Streamline
const streamlineProject: DesignProject = {
  id: "streamline",
  name: "Streamline",
  type: "saas",
  description: "AI-powered project management for modern teams",
  chatHistory: [
    {
      role: "user",
      content: "Create a brand guide for my project management SaaS",
    },
    {
      role: "ai",
      content: "I'll create a comprehensive brand guide for Streamline. Let me analyze your product and target audience...",
    },
    {
      role: "user",
      content: "Make it feel innovative and trustworthy",
    },
    {
      role: "ai",
      content: "Perfect! I've adjusted the brand to balance innovation with reliability. The blue and purple palette conveys trust while the gradients add a modern, tech-forward feel. Check out the Brand Guide tab! 🎨",
    },
  ],
  valueProp: {
    headline: "Manage projects 3x faster with AI",
    subheadline: "Stop juggling tools. Streamline brings planning, execution, and insights into one intelligent workspace.",
    problem: "Teams waste 15+ hours weekly switching between tools, updating status, and chasing context.",
    solution: "AI-powered automation handles routine updates, smart scheduling prevents bottlenecks, and unified workspace keeps everyone aligned.",
    outcome: "Ship features 3x faster while reducing team burnout by 40%. Focus on building, not managing.",
    benefits: [
      "AI assistant handles standup updates automatically",
      "Smart scheduling prevents resource conflicts",
      "One-click insights reveal blockers instantly",
      "Integrates with GitHub, Slack, Figma seamlessly",
    ],
    targetAudience: "Product teams (5-50 people) at B2B SaaS startups tired of tool sprawl and status meetings.",
    ctaSuggestions: [
      "Start Free Trial",
      "See It In Action",
      "Book a Demo",
      "Get Started Free",
    ],
  },
  brandGuide: {
    colors: {
      primary: [
        { name: "Blue 600", hex: "#3B82F6", rgb: "59, 130, 246", usage: "Primary actions, links, key UI elements" },
        { name: "Blue 700", hex: "#2563EB", rgb: "37, 99, 235", usage: "Hover states, emphasis" },
      ],
      secondary: [
        { name: "Purple 600", hex: "#8B5CF6", rgb: "139, 92, 246", usage: "Secondary actions, accents" },
        { name: "Purple 700", hex: "#7C3AED", rgb: "124, 58, 237", usage: "Hover states" },
      ],
      accent: [
        { name: "Teal 500", hex: "#14B8A6", rgb: "20, 184, 166", usage: "Success states, positive feedback" },
        { name: "Cyan 400", hex: "#22D3EE", rgb: "34, 211, 238", usage: "Highlights, special callouts" },
      ],
      neutral: [
        { name: "Slate 900", hex: "#0F172A", rgb: "15, 23, 42", usage: "Primary text" },
        { name: "Slate 600", hex: "#475569", rgb: "71, 85, 105", usage: "Secondary text" },
        { name: "Slate 200", hex: "#E2E8F0", rgb: "226, 232, 240", usage: "Borders, dividers" },
        { name: "Slate 50", hex: "#F8FAFC", rgb: "248, 250, 252", usage: "Backgrounds" },
      ],
    },
    typography: [
      {
        category: "heading",
        fontFamily: "Inter",
        sizes: [
          { name: "H1", size: "48px", weight: "700" },
          { name: "H2", size: "36px", weight: "700" },
          { name: "H3", size: "24px", weight: "600" },
          { name: "H4", size: "20px", weight: "600" },
        ],
      },
      {
        category: "body",
        fontFamily: "Inter",
        sizes: [
          { name: "Large", size: "18px", weight: "400" },
          { name: "Base", size: "16px", weight: "400" },
          { name: "Small", size: "14px", weight: "400" },
        ],
      },
      {
        category: "code",
        fontFamily: "JetBrains Mono",
        sizes: [
          { name: "Code", size: "14px", weight: "400" },
        ],
      },
    ],
    logoVariations: [
      { name: "Primary Logo", description: "Full color logo with icon and wordmark" },
      { name: "Icon Only", description: "Compact icon for small spaces" },
      { name: "Wordmark", description: "Text-only logo for horizontal layouts" },
      { name: "Monochrome", description: "Single-color version for light backgrounds" },
    ],
    toneOfVoice: ["Confident", "Innovative", "Approachable", "Clear", "Energetic"],
    personalityTraits: [
      { id: "professional", label: "Tone", leftLabel: "Playful", rightLabel: "Professional", value: 65 },
      { id: "formal", label: "Style", leftLabel: "Casual", rightLabel: "Formal", value: 55 },
      { id: "technical", label: "Language", leftLabel: "Simple", rightLabel: "Technical", value: 60 },
      { id: "bold", label: "Visuals", leftLabel: "Minimal", rightLabel: "Bold", value: 70 },
    ],
  },
  styleGuide: {
    buttons: [
      { variant: "Primary", description: "Main CTAs and key actions" },
      { variant: "Secondary", description: "Supporting actions" },
      { variant: "Outline", description: "Tertiary actions" },
      { variant: "Ghost", description: "Low-priority actions" },
      { variant: "Destructive", description: "Delete or remove actions" },
    ],
    cards: [
      { variant: "Default", description: "Standard content containers" },
      { variant: "Elevated", description: "Emphasized content with shadow" },
      { variant: "Outlined", description: "Subtle borders, no shadow" },
      { variant: "Interactive", description: "Hoverable, clickable cards" },
    ],
    formElements: [
      { element: "Text Input", description: "Single-line text entry" },
      { element: "Textarea", description: "Multi-line text entry" },
      { element: "Select Dropdown", description: "Choose from options" },
      { element: "Checkbox", description: "Multiple selections" },
      { element: "Radio Button", description: "Single selection from group" },
      { element: "Toggle Switch", description: "On/off states" },
    ],
    spacing: [
      { name: "xs", value: "4px" },
      { name: "sm", value: "8px" },
      { name: "md", value: "16px" },
      { name: "lg", value: "24px" },
      { name: "xl", value: "32px" },
      { name: "2xl", value: "48px" },
      { name: "3xl", value: "64px" },
    ],
    borderRadius: [
      { name: "sm", value: "4px" },
      { name: "md", value: "8px" },
      { name: "lg", value: "12px" },
      { name: "xl", value: "16px" },
      { name: "full", value: "9999px" },
    ],
    shadows: [
      { name: "sm", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
      { name: "md", value: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
      { name: "lg", value: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
      { name: "xl", value: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
    ],
  },
  landingPage: {
    navigation: {
      logo: "Streamline",
      links: ["Features", "Pricing", "Customers", "Resources", "Company"],
    },
    hero: {
      headline: "Manage projects 3x faster with AI",
      subheadline: "Stop juggling tools. Streamline brings planning, execution, and insights into one intelligent workspace built for modern product teams.",
      cta: {
        primary: "Start Free Trial",
        secondary: "Watch Demo",
      },
    },
    features: [
      {
        title: "AI Project Assistant",
        description: "Automatically generate updates, summarize progress, and surface blockers without manual status meetings.",
        icon: "sparkles",
      },
      {
        title: "Smart Scheduling",
        description: "Intelligent resource allocation prevents conflicts and suggests optimal timelines based on team capacity.",
        icon: "calendar",
      },
      {
        title: "Unified Workspace",
        description: "Connect GitHub, Figma, Slack, and more. All your context in one place, always up to date.",
        icon: "layers",
      },
      {
        title: "Real-time Insights",
        description: "Instant visibility into project health, velocity trends, and team workload with one-click reporting.",
        icon: "chart",
      },
      {
        title: "Async Collaboration",
        description: "Work across timezones seamlessly. Threaded discussions, @mentions, and smart notifications keep everyone aligned.",
        icon: "users",
      },
      {
        title: "Custom Workflows",
        description: "Adapt Streamline to your process. Create custom views, automations, and dashboards without code.",
        icon: "settings",
      },
    ],
    socialProof: [
      { type: "testimonial", content: "\"Streamline cut our planning time from 8 hours to 2. It's like having a project manager on autopilot.\" - Sarah Chen, VP Product at TechCorp" },
      { type: "stat", content: "10,000+ teams ship faster with Streamline" },
      { type: "testimonial", content: "\"Finally, a PM tool that doesn't feel like homework. Our team actually enjoys using it.\" - Marcus Rivera, Engineering Lead" },
    ],
    pricing: [
      {
        tier: "Starter",
        price: "$12/user/month",
        features: ["Up to 10 users", "Unlimited projects", "Basic integrations", "Email support", "7-day history"],
      },
      {
        tier: "Pro",
        price: "$24/user/month",
        features: ["Unlimited users", "AI Project Assistant", "Advanced integrations", "Priority support", "Unlimited history", "Custom workflows"],
      },
      {
        tier: "Enterprise",
        price: "Custom",
        features: ["Everything in Pro", "SSO & SAML", "Dedicated success manager", "SLA guarantee", "Advanced security", "Custom contracts"],
      },
    ],
    footer: {
      sections: [
        { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"] },
        { title: "Resources", links: ["Blog", "Documentation", "Help Center", "API Reference", "Community"] },
        { title: "Company", links: ["About", "Careers", "Contact", "Privacy", "Terms"] },
      ],
    },
  },
};

// Agency Project: Pixel Perfect Studios
const pixelPerfectProject: DesignProject = {
  id: "pixel-perfect",
  name: "Pixel Perfect Studios",
  type: "agency",
  description: "Design agency crafting brands that convert",
  chatHistory: [
    {
      role: "user",
      content: "Create a bold brand guide for my design agency",
    },
    {
      role: "ai",
      content: "Perfect! I'll create a brand that showcases your creative edge. Let me craft something that really stands out...",
    },
    {
      role: "user",
      content: "I want it to feel creative but also professional",
    },
    {
      role: "ai",
      content: "Love that balance! I've gone with a sophisticated dark palette with vibrant orange accents. It's bold enough to show your creativity while maintaining professional credibility. Check out the Brand Guide! 🎨",
    },
  ],
  valueProp: {
    headline: "Brands that capture hearts and convert clicks",
    subheadline: "We design digital experiences that don't just look stunning—they drive real business results.",
    problem: "Generic branding drowns in noise. Your competitors look the same. Your unique story gets lost.",
    solution: "Strategic brand design rooted in psychology, data, and storytelling. We craft identities that resonate emotionally and convert rationally.",
    outcome: "Stand out instantly. Build trust faster. Convert 2-3x more visitors into customers. Own your category.",
    benefits: [
      "Research-backed brand strategy, not just pretty pixels",
      "Complete brand systems delivered in 4 weeks",
      "Conversion-optimized designs that perform",
      "Dedicated Slack channel for real-time collaboration",
    ],
    targetAudience: "Funded startups ($1M-$10M) and scale-ups ready to level up from DIY branding to professional brand that commands premium pricing.",
    ctaSuggestions: [
      "Book Strategy Call",
      "View Our Work",
      "Start Your Project",
      "Get a Quote",
    ],
  },
  brandGuide: {
    colors: {
      primary: [
        { name: "Slate 900", hex: "#0F172A", rgb: "15, 23, 42", usage: "Primary backgrounds, bold statements" },
        { name: "Slate 800", hex: "#1E293B", rgb: "30, 41, 59", usage: "Secondary backgrounds" },
      ],
      secondary: [
        { name: "Orange 500", hex: "#F97316", rgb: "249, 115, 22", usage: "Primary CTAs, key highlights" },
        { name: "Orange 600", hex: "#EA580C", rgb: "234, 88, 12", usage: "Hover states, emphasis" },
      ],
      accent: [
        { name: "Yellow 400", hex: "#FDE047", rgb: "253, 224, 71", usage: "Highlights, attention grabbers" },
        { name: "Amber 500", hex: "#F59E0B", rgb: "245, 158, 11", usage: "Secondary accents" },
      ],
      neutral: [
        { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Text on dark, key content" },
        { name: "Slate 300", hex: "#CBD5E1", rgb: "203, 213, 225", usage: "Secondary text on dark" },
        { name: "Slate 700", hex: "#334155", rgb: "51, 65, 85", usage: "Muted elements" },
        { name: "Slate 950", hex: "#020617", rgb: "2, 6, 23", usage: "Deepest backgrounds" },
      ],
    },
    typography: [
      {
        category: "heading",
        fontFamily: "Epilogue",
        sizes: [
          { name: "H1", size: "64px", weight: "800" },
          { name: "H2", size: "48px", weight: "700" },
          { name: "H3", size: "32px", weight: "700" },
          { name: "H4", size: "24px", weight: "600" },
        ],
      },
      {
        category: "body",
        fontFamily: "Inter",
        sizes: [
          { name: "Large", size: "20px", weight: "400" },
          { name: "Base", size: "16px", weight: "400" },
          { name: "Small", size: "14px", weight: "400" },
        ],
      },
      {
        category: "code",
        fontFamily: "Space Mono",
        sizes: [
          { name: "Code", size: "14px", weight: "400" },
        ],
      },
    ],
    logoVariations: [
      { name: "Primary Dark", description: "White logo on dark backgrounds" },
      { name: "Primary Light", description: "Dark logo on light backgrounds" },
      { name: "Icon Mark", description: "Standalone icon for social media" },
      { name: "Wordmark", description: "Typography-based logo variant" },
    ],
    toneOfVoice: ["Bold", "Creative", "Confident", "Authentic", "Strategic"],
    personalityTraits: [
      { id: "professional", label: "Tone", leftLabel: "Playful", rightLabel: "Professional", value: 45 },
      { id: "formal", label: "Style", leftLabel: "Casual", rightLabel: "Formal", value: 40 },
      { id: "technical", label: "Language", leftLabel: "Simple", rightLabel: "Technical", value: 35 },
      { id: "bold", label: "Visuals", leftLabel: "Minimal", rightLabel: "Bold", value: 85 },
    ],
  },
  styleGuide: {
    buttons: [
      { variant: "Primary", description: "Orange gradient, bold CTAs" },
      { variant: "Secondary", description: "Outlined with orange border" },
      { variant: "Ghost", description: "Transparent with hover effect" },
      { variant: "Dark", description: "Dark background for light sections" },
    ],
    cards: [
      { variant: "Dark Glass", description: "Semi-transparent dark cards with blur" },
      { variant: "Elevated", description: "Strong shadows, lifted appearance" },
      { variant: "Bordered", description: "Subtle borders with dark background" },
    ],
    formElements: [
      { element: "Text Input", description: "Dark input with orange focus ring" },
      { element: "Textarea", description: "Large text entry with counter" },
      { element: "Select", description: "Custom styled dropdown" },
      { element: "Checkbox", description: "Orange checkmark on dark" },
    ],
    spacing: [
      { name: "xs", value: "4px" },
      { name: "sm", value: "8px" },
      { name: "md", value: "16px" },
      { name: "lg", value: "24px" },
      { name: "xl", value: "32px" },
      { name: "2xl", value: "48px" },
      { name: "3xl", value: "64px" },
    ],
    borderRadius: [
      { name: "sm", value: "6px" },
      { name: "md", value: "12px" },
      { name: "lg", value: "16px" },
      { name: "xl", value: "24px" },
    ],
    shadows: [
      { name: "glow", value: "0 0 20px rgba(249, 115, 22, 0.3)" },
      { name: "md", value: "0 8px 16px rgba(0, 0, 0, 0.4)" },
      { name: "lg", value: "0 16px 32px rgba(0, 0, 0, 0.5)" },
      { name: "xl", value: "0 24px 48px rgba(0, 0, 0, 0.6)" },
    ],
  },
  landingPage: {
    navigation: {
      logo: "Pixel Perfect",
      links: ["Work", "Services", "Process", "About", "Contact"],
    },
    hero: {
      headline: "Brands that capture hearts and convert clicks",
      subheadline: "We're a design studio that crafts bold, strategic brands for companies ready to dominate their category. No templates. No generic work. Just results.",
      cta: {
        primary: "Book Strategy Call",
        secondary: "View Our Work",
      },
    },
    features: [
      {
        title: "Brand Strategy",
        description: "Deep research into your market, competitors, and audience psychology. We uncover opportunities others miss.",
        icon: "target",
      },
      {
        title: "Visual Identity",
        description: "Logos, color systems, typography, and brand guidelines that scale from business card to billboard.",
        icon: "palette",
      },
      {
        title: "Web Design",
        description: "Conversion-optimized websites that showcase your brand and turn visitors into customers.",
        icon: "monitor",
      },
      {
        title: "Brand Guidelines",
        description: "Comprehensive documentation ensuring consistent brand execution across all touchpoints.",
        icon: "book",
      },
      {
        title: "Marketing Assets",
        description: "Social media templates, pitch decks, one-pagers, and everything you need to market confidently.",
        icon: "image",
      },
      {
        title: "Ongoing Support",
        description: "Post-launch support to refine, iterate, and evolve your brand as your company grows.",
        icon: "refresh",
      },
    ],
    socialProof: [
      { type: "testimonial", content: "\"Pixel Perfect transformed our brand from startup-generic to category-leader. Our close rate doubled.\" - Alex Morgan, CEO at GrowthKit" },
      { type: "stat", content: "Brands we've designed have raised $150M+ in funding" },
      { type: "testimonial", content: "\"They didn't just design a logo. They gave us clarity, confidence, and a brand we're proud to build behind.\" - Jamie Lee, Founder" },
    ],
    footer: {
      sections: [
        { title: "Services", links: ["Brand Strategy", "Visual Identity", "Web Design", "Brand Guidelines", "Marketing Assets"] },
        { title: "Company", links: ["Work", "About", "Process", "Careers", "Contact"] },
        { title: "Resources", links: ["Blog", "Case Studies", "Brand Guide", "Design Tips", "Pricing"] },
      ],
    },
  },
};

export const mockProjects: Record<"saas" | "agency", DesignProject> = {
  saas: streamlineProject,
  agency: pixelPerfectProject,
};

