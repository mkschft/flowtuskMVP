/**
 * Few-Shot Examples for Prompt Templates
 * 
 * Provides high-quality examples to guide the model toward
 * better, more consistent outputs with proper evidence tracking.
 */

// ============================================================================
// ICP Generation Examples
// ============================================================================

export const ICP_EXAMPLE_1 = {
  input: {
    brand: {
      name: "TaxPro",
      tones: ["professional", "trustworthy"],
      primaryCTA: "Start Free Trial"
    },
    facts: [
      {
        id: "fact-1",
        text: "Automates tax calculations with AI",
        page: "/features",
        evidence: "Our AI-powered engine automates complex tax calculations..."
      },
      {
        id: "fact-2",
        text: "Serves mid-market accounting firms (50-500 employees)",
        page: "/customers",
        evidence: "Trusted by 500+ mid-market accounting firms..."
      },
      {
        id: "fact-3",
        text: "40% time savings on tax preparation",
        page: "/features",
        evidence: "Customers report 40% reduction in tax prep time..."
      },
      {
        id: "fact-4",
        text: "Built-in compliance checks for IRS regulations",
        page: "/compliance",
        evidence: "Automatic compliance validation against latest IRS rules..."
      }
    ],
    pains: ["Manual calculations", "Compliance risks", "Time constraints"],
    valueProps: [
      {
        id: "v1",
        text: "Automate tax workflows with AI-powered accuracy",
        evidence: ["fact-1", "fact-3"]
      }
    ]
  },
  output: {
    icps: [
      {
        id: "icp-1",
        title: "Mid-Market Accounting Firm Owners",
        description: "Partners and owners of accounting firms (50-500 employees) looking to scale operations during tax season.",
        painPoints: ["Manual workflows", "Staff burnout", "Error risks"],
        goals: ["Automate processes", "Scale client base", "Reduce errors"],
        demographics: "Accounting firms with 50-500 employees, handling 200+ corporate clients annually",
        personaName: "Sarah Martinez",
        personaRole: "Managing Partner",
        personaCompany: "Martinez & Associates CPA (120 employees)",
        location: "Chicago",
        country: "United States",
        evidence: ["fact-2", "fact-3", "fact-4"]
      }
    ],
    summary: {
      businessDescription: "TaxPro is an AI-powered tax automation platform serving mid-market accounting firms (50-500 employees) with intelligent tax calculation and compliance checking.",
      targetMarket: "Professional accounting firms handling corporate tax preparation at scale",
      painPointsWithMetrics: [
        {
          pain: "Manual tax calculations consuming excessive staff time",
          metric: "40% of billable hours lost to manual data entry"
        },
        {
          pain: "Compliance risk from human error in complex tax scenarios",
          metric: "$25,000 average penalty for filing errors"
        },
        {
          pain: "Unable to scale client base during tax season",
          metric: "50% capacity constraint limiting growth"
        }
      ]
    }
  }
};

export const ICP_EXAMPLE_2 = {
  input: {
    brand: {
      name: "DevTools Pro",
      tones: ["technical", "developer-focused"],
      primaryCTA: "Try Free"
    },
    facts: [
      {
        id: "fact-1",
        text: "Code review automation for GitHub",
        page: "/product",
        evidence: "Automatically review pull requests in GitHub..."
      },
      {
        id: "fact-2",
        text: "Used by 10,000+ engineering teams",
        page: "/customers",
        evidence: "Over 10,000 engineering teams trust DevTools Pro..."
      },
      {
        id: "fact-3",
        text: "Reduces code review time by 60%",
        page: "/features",
        evidence: "Teams see 60% reduction in code review cycle time..."
      }
    ],
    pains: ["Slow reviews", "Quality issues", "Team bottlenecks"],
    valueProps: [
      {
        id: "v1",
        text: "Accelerate code reviews with AI-powered automation",
        evidence: ["fact-1", "fact-3"]
      }
    ]
  },
  output: {
    icps: [
      {
        id: "icp-1",
        title: "Engineering Managers (Fast-Growing Startups)",
        description: "Engineering leaders at Series A-C startups scaling teams rapidly while maintaining code quality.",
        painPoints: ["Review bottlenecks", "Quality variance", "Team scaling"],
        goals: ["Speed up shipping", "Maintain quality", "Scale team"],
        demographics: "Engineering teams 10-50 developers, shipping 100+ PRs per week",
        personaName: "Alex Chen",
        personaRole: "VP of Engineering",
        personaCompany: "CloudFlow (Series B, 35 engineers)",
        location: "San Francisco",
        country: "United States",
        evidence: ["fact-2", "fact-3"]
      }
    ],
    summary: {
      businessDescription: "DevTools Pro automates code review workflows for engineering teams using AI to catch issues early and reduce review cycle time.",
      targetMarket: "Fast-growing engineering teams at startups and scale-ups (10-100 developers)",
      painPointsWithMetrics: [
        {
          pain: "Code review bottlenecks slowing deployment velocity",
          metric: "60% of dev time waiting for reviews"
        },
        {
          pain: "Inconsistent code quality across large team",
          metric: "30% of bugs from missed review issues"
        }
      ]
    }
  }
};

// ============================================================================
// Value Proposition Examples
// ============================================================================

export const VALUE_PROP_EXAMPLE_1 = {
  input: {
    icp: {
      id: "icp-1",
      title: "Mid-Market Accounting Firm Owners",
      painPoints: ["Manual workflows", "Staff burnout", "Error risks"],
      goals: ["Automate processes", "Scale client base", "Reduce errors"],
    },
    facts: [
      {
        id: "fact-3",
        text: "40% time savings on tax preparation",
        page: "/features",
        evidence: "Customers report 40% reduction in tax prep time..."
      },
      {
        id: "fact-4",
        text: "Built-in compliance checks",
        page: "/compliance",
        evidence: "Automatic compliance validation..."
      }
    ]
  },
  output: {
    variations: [
      {
        id: "benefit-first",
        style: "Benefit-First",
        text: "Cut tax preparation time by 40% with AI-powered automation and built-in compliance checks, allowing your firm to handle 2x more clients without hiring.",
        useCase: "Website hero, ad copy",
        emoji: "🔥",
        sourceFactIds: ["fact-3", "fact-4"]
      },
      {
        id: "pain-first",
        style: "Pain-First",
        text: "Manual tax calculations eating your staff's time? Automate complex workflows and eliminate compliance risks with AI that learns from 10,000+ tax returns.",
        useCase: "LinkedIn posts, emails",
        emoji: "💔",
        sourceFactIds: ["fact-3", "fact-4"]
      }
    ]
  }
};

export const VALUE_PROP_EXAMPLE_2 = {
  input: {
    icp: {
      id: "icp-1",
      title: "Engineering Managers (Fast-Growing Startups)",
      painPoints: ["Review bottlenecks", "Quality variance", "Team scaling"],
      goals: ["Speed up shipping", "Maintain quality", "Scale team"],
    },
    facts: [
      {
        id: "fact-3",
        text: "Reduces code review time by 60%",
        page: "/features",
        evidence: "Teams see 60% reduction in code review cycle time..."
      }
    ]
  },
  output: {
    variations: [
      {
        id: "benefit-first",
        style: "Benefit-First",
        text: "Ship code 60% faster with AI-powered code reviews that catch bugs before your team does, giving you more time to build features.",
        useCase: "Website hero, ad copy",
        emoji: "🔥",
        sourceFactIds: ["fact-3"]
      },
      {
        id: "pain-first",
        style: "Pain-First",
        text: "Tired of PRs sitting for days waiting for review? Automate the tedious parts and let your team focus on architecture and design decisions.",
        useCase: "LinkedIn posts, emails",
        emoji: "💔",
        sourceFactIds: ["fact-3"]
      }
    ]
  }
};

// ============================================================================
// Email Examples
// ============================================================================

export const EMAIL_EXAMPLE_1 = {
  input: {
    icp: {
      title: "Mid-Market Accounting Firm Owners",
      personaName: "Sarah",
      painPoints: ["Manual workflows", "Staff burnout"],
    },
    valueProp: {
      text: "Cut tax prep time by 40%",
    },
    facts: [
      {
        id: "fact-3",
        text: "40% time savings",
        evidence: "..."
      }
    ]
  },
  output: {
    subjectLines: {
      A: "Cut your tax prep time by 40% this season",
      B: "How Martinez & Associates handles 2x more clients",
      C: "Your team spending 40 hours/week on manual tax work?"
    },
    emailBody: "Hi Sarah,\n\nI noticed Martinez & Associates handles a high volume of corporate tax returns. With tax season approaching, I wanted to share how firms like yours are cutting preparation time by 40%.\n\nInstead of spending 40+ hours per week on manual calculations, our AI handles the tedious work while your team focuses on strategy and client relationships.\n\n500+ mid-market firms use TaxPro to:\n• Automate complex tax calculations\n• Eliminate compliance risks with built-in IRS checks\n• Handle 2x more clients without hiring\n\nWould you be open to a 15-minute demo to see how this could work for your firm?",
    cta: "Book a 15-minute demo",
    sourceFactIds: ["fact-3"]
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get formatted ICP example for prompt inclusion
 */
export function getICPExampleText(exampleNum: 1 | 2 = 1): string {
  const example = exampleNum === 1 ? ICP_EXAMPLE_1 : ICP_EXAMPLE_2;
  
  return `EXAMPLE INPUT:
${JSON.stringify(example.input, null, 2)}

EXAMPLE OUTPUT:
${JSON.stringify(example.output, null, 2)}`;
}

/**
 * Get formatted Value Prop example for prompt inclusion
 */
export function getValuePropExampleText(exampleNum: 1 | 2 = 1): string {
  const example = exampleNum === 1 ? VALUE_PROP_EXAMPLE_1 : VALUE_PROP_EXAMPLE_2;
  
  return `EXAMPLE INPUT:
${JSON.stringify(example.input, null, 2)}

EXAMPLE OUTPUT:
${JSON.stringify(example.output, null, 2)}`;
}

/**
 * Get formatted Email example for prompt inclusion
 */
export function getEmailExampleText(): string {
  return `EXAMPLE INPUT:
${JSON.stringify(EMAIL_EXAMPLE_1.input, null, 2)}

EXAMPLE OUTPUT:
${JSON.stringify(EMAIL_EXAMPLE_1.output, null, 2)}`;
}

/**
 * Get all examples as formatted text
 */
export function getAllExamplesText(): {
  icp: string;
  valueProp: string;
  email: string;
} {
  return {
    icp: getICPExampleText(1),
    valueProp: getValuePropExampleText(1),
    email: getEmailExampleText(),
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  ICP_EXAMPLE_1,
  ICP_EXAMPLE_2,
  VALUE_PROP_EXAMPLE_1,
  VALUE_PROP_EXAMPLE_2,
  EMAIL_EXAMPLE_1,
  getICPExampleText,
  getValuePropExampleText,
  getEmailExampleText,
  getAllExamplesText,
};

