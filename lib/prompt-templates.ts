/**
 * 3-Layer Prompt Architecture Templates
 * 
 * Following OpenAI's best practices:
 * - Layer 1 (System): Role, guardrails, output format
 * - Layer 2 (Developer): Task contract, rules, schema
 * - Layer 3 (User): Grounding context with actual data
 * 
 * Each template returns structured prompts that ensure specific,
 * evidence-based outputs instead of generic marketing advice.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface PromptTemplate {
  system: string;
  developer: string;
  user: string;
  schema?: object;
}

export interface FactsJSON {
  brand: {
    name: string;
    tones: string[];
    primaryCTA: string;
  };
  structure: {
    nav: string[];
    keyPages: Array<{ path: string; title: string }>;
    footer: string[];
  };
  targetMarket?: {
    primaryRegion: string;
    industryFocus?: string;
    signals?: string[];
  };
  audienceSignals: string[];
  valueProps: Array<{
    id: string;
    text: string;
    evidence: string[];
  }>;
  pains: string[];
  proof: string[];
  facts: Array<{
    id: string;
    text: string;
    page: string;
    evidence: string;
  }>;
}

export interface ICP {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
  personaName: string;
  personaRole: string;
  personaCompany: string;
  location: string;
  country: string;
  evidence?: string[];
}

export interface ValueProp {
  summary?: {
    mainInsight?: string;
    painPointsAddressed?: string[];
    approachStrategy?: string;
    expectedImpact?: string;
  };
  variables: Array<{
    key: string;
    label: string;
    type?: string;
    options?: string[];
    selectedValue: string;
    placeholder?: string;
  }>;
  variations: Array<{
    id: string;
    style: string;
    text: string;
    useCase?: string;
    emoji?: string;
    sourceFactIds?: string[];
  }>;
}

export interface EmailUserChoices {
  tone?: string;
  cta?: string;
  length?: string;
  style?: string;
}

// ============================================================================
// STAGE A: Website Analysis → Facts JSON Extraction
// ============================================================================

export function buildAnalyzePrompt(websiteContent: string): PromptTemplate {
  const system = `You are a business analyst extracting verifiable facts from website content.

OUTPUT FORMAT: Valid JSON only. No commentary, no markdown, no explanations.

GUARDRAILS:
- Use ONLY content provided in the input
- Keep facts atomic (one fact = one claim)
- Cite page sources for every fact
- No marketing advice or recommendations
- No invented data or assumptions`;

  const developer = `TASK: Extract structured facts from website content that can be reused across all marketing content generation.

RULES:
1. Extract brand identity (name, tone, primary CTA)
2. Map site structure (nav, key pages, footer links)
3. Identify target market geography (primary region, industry focus)
4. Identify audience signals (who they serve)
5. List value propositions with evidence
6. Extract pain points they address
7. Note proof elements (certs, logos, metrics)
8. Create atomic facts array with IDs

GEOGRAPHIC SIGNALS TO IDENTIFY:
- Domain extensions (.co.uk = UK, .com.au = Australia, .de = Germany)
- Language/spelling (colour vs color, centre vs center)
- Currency symbols (£, €, $)
- Location mentions (cities, regions, countries)
- Local regulations/standards (GDPR, Ofsted, FDA)
- Phone number formats
- Address information

CONSTRAINTS:
- Each fact must cite its page/section
- Evidence must be exact snippets from content
- Keep facts neutral and verifiable
- No interpretation or analysis
- facts array should have 10-20 items minimum

SCHEMA:
{
  "brand": {
    "name": "string",
    "tones": ["string"],
    "primaryCTA": "string"
  },
  "structure": {
    "nav": ["string"],
    "keyPages": [{"path": "string", "title": "string"}],
    "footer": ["string"]
  },
  "targetMarket": {
    "primaryRegion": "string (e.g. UK, United States, Europe, Australia, Global)",
    "industryFocus": "string (e.g. EdTech, FinTech, Healthcare) - optional",
    "signals": ["Evidence from content that indicates geographic market"]
  },
  "audienceSignals": ["string"],
  "valueProps": [
    {"id": "v1", "text": "string", "evidence": ["fact-3", "fact-7"]}
  ],
  "pains": ["string"],
  "proof": ["string"],
  "facts": [
    {"id": "fact-1", "text": "string", "page": "string", "evidence": "exact snippet"}
  ]
}`;

  const user = `WEBSITE CONTENT:
${websiteContent}

Extract structured facts following the schema above. Generate 10-20 atomic facts minimum.`;

  return { system, developer, user };
}

// ============================================================================
// STAGE B: ICP Generation from Facts
// ============================================================================

export function buildICPPrompt(facts: FactsJSON): PromptTemplate {
  const system = `You are a B2B marketing strategist specializing in ideal customer profiling.

OUTPUT FORMAT: Valid JSON only. Must match schema exactly.

GUARDRAILS:
- Base all insights on provided facts
- No invented data or assumptions
- If uncertain, use empty strings/arrays
- Be specific and quantifiable
- Avoid marketing clichés`;

  const developer = `TASK: Generate 3 distinct Ideal Customer Profiles (ICPs) from website facts.

RULES:
1. Create 3 unique segments (different sizes, roles, or industries)
2. Each ICP must reference specific facts via evidence field
3. Pain points must map to website facts
4. Goals must be realistic and specific
5. Personas should be diverse and realistic
6. Keep painPoints SHORT (1-3 words: "Time constraints", "Manual processes")

GEOGRAPHIC RELEVANCE (CRITICAL):
${facts.targetMarket?.primaryRegion ? `- Target region is ${facts.targetMarket.primaryRegion}
- Generate personas with ${facts.targetMarket.primaryRegion}-relevant locations, companies, and institutions
- Use ${facts.targetMarket.primaryRegion}-specific terminology and context
- Example for UK: Use cities like London, Manchester, Birmingham; companies like "Academy Trust (12 schools)"
- Example for US: Use cities like San Francisco, New York, Austin; companies like "Tech Startup (50 employees)"
` : `- No explicit region specified - use globally-recognized examples but prefer diverse geographic distribution
`}

EVIDENCE REQUIREMENT:
- Every pain point and goal should map to at least one fact ID
- Use evidence field to track which facts support each ICP
- Example: "evidence": ["fact-2", "fact-5", "fact-8"]

EXAMPLE (Study this structure):
INPUT FACTS: Website about tax software
- fact-1: "Automates tax calculations with AI"
- fact-2: "Serves mid-market accounting firms (50-500 employees)"
- fact-3: "40% time savings on tax preparation"

OUTPUT ICP:
{
  "id": "icp-1",
  "title": "Mid-Market Accounting Firm Owners",
  "description": "Partners and owners of accounting firms (50-500 employees) looking to scale operations during tax season.",
  "painPoints": ["Manual workflows", "Staff burnout", "Error risks"],
  "goals": ["Automate processes", "Scale client base", "Reduce errors"],
  "demographics": "Accounting firms with 50-500 employees, handling 200+ corporate clients annually",
  "personaName": "Sarah Martinez",
  "personaRole": "Managing Partner",
  "personaCompany": "Martinez & Associates CPA (120 employees)",
  "location": "Chicago",
  "country": "United States",
  "evidence": ["fact-2", "fact-3"]
}

Now generate ICPs following this example structure.

SCHEMA:
{
  "icps": [
    {
      "id": "unique-id",
      "title": "Segment title",
      "description": "One sentence description",
      "painPoints": ["Short pain 1-3 words"],
      "goals": ["goal1", "goal2"],
      "demographics": "Brief demographics",
      "personaName": "Full name",
      "personaRole": "Job title",
      "personaCompany": "Company (size)",
      "location": "City",
      "country": "Country",
      "evidence": ["fact-2", "fact-5"]
    }
  ],
  "summary": {
    "businessDescription": "2-3 sentences",
    "targetMarket": "Market description",
    "painPointsWithMetrics": [
      {
        "pain": "Pain description",
        "metric": "Quantified impact"
      }
    ]
  }
}`;

  const user = `WEBSITE FACTS:
${JSON.stringify(facts, null, 2)}
${facts.targetMarket?.primaryRegion ? `

IMPORTANT: This company targets ${facts.targetMarket.primaryRegion}. Generate personas with locations, companies, and institutions relevant to ${facts.targetMarket.primaryRegion}.` : ''}

Generate 3 ICPs with evidence tracking. Use only the facts above.`;

  return { system, developer, user };
}

// ============================================================================
// STAGE C: Value Proposition Generation
// ============================================================================

export function buildValuePropPrompt(facts: FactsJSON, icp: ICP): PromptTemplate {
  const system = `You are a conversion copywriter specializing in value propositions.

OUTPUT FORMAT: Valid JSON only. No markdown, no commentary.

GUARDRAILS:
- Output must be copy-paste ready
- Quantify benefits when facts support it
- Cite source facts for every claim
- Be specific, avoid generic advice
- No placeholders or templates`;

  const developer = `TASK: Generate value proposition variations mapped to the ICP's pains and goals.

RULES:
1. Generate flat fields for direct UI display:
   - headline: Main value prop (1 punchy sentence, use best variation text)
   - subheadline: Supporting detail (1-2 sentences expanding on headline)
   - problem: Main pain point from ICP (1-2 sentences, cite ICP painPoints)
   - solution: How the product solves it (1-2 sentences, cite facts)
   - outcome: The transformation achieved (1 sentence with metrics)
   - targetAudience: From ICP title (e.g., "${icp.title}")
   - benefits: 3-5 specific benefits (extract from variations or facts)
2. Create 5 distinct variations (benefit-first, pain-first, social proof, question, story)
3. Each variation: 1-2 sentences max
4. Map to ICP pains/goals AND website facts
5. Include sourceFactIds for traceability
6. Generate customizable variables (role, industry, region, pain, metric, method, solution)
7. Provide compact summary (mainInsight, painPointsAddressed, expectedImpact)

EVIDENCE REQUIREMENT (CRITICAL):
- Every variation MUST cite sourceFactIds
- sourceFactIds must reference actual fact IDs from the Facts JSON
- Example: "sourceFactIds": ["fact-3", "fact-7"]
- If no direct fact supports a claim, use related facts or omit the claim

EXAMPLE (Study this structure):
INPUT:
- ICP pain: "Manual workflows"
- Fact-3: "40% time savings on tax preparation"
- Fact-4: "Built-in compliance checks"

OUTPUT VARIATION:
{
  "id": "benefit-first",
  "style": "Benefit-First",
  "text": "Cut tax preparation time by 40% with AI-powered automation and built-in compliance checks, allowing your firm to handle 2x more clients without hiring.",
  "useCase": "Website hero, ad copy",
  "emoji": "🔥",
  "sourceFactIds": ["fact-3", "fact-4"]
}

Now generate variations following this example structure.

SCHEMA:
{
  "headline": "Main value prop headline (1 sentence)",
  "subheadline": "Supporting subheadline (1-2 sentences)",
  "problem": "The main pain point addressed (1-2 sentences)",
  "solution": "How the product/service solves it (1-2 sentences)",
  "outcome": "The transformation/benefit achieved (1 sentence with metrics)",
  "targetAudience": "Who this is for (e.g., 'Product managers at B2B SaaS startups')",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "summary": {
    "mainInsight": "1-2 sentences",
    "painPointsAddressed": ["pain1", "pain2", "pain3"],
    "approachStrategy": "1 sentence",
    "expectedImpact": "Quantified benefit"
  },
  "variables": [
    {
      "key": "role",
      "label": "Target Role",
      "type": "dropdown",
      "options": ["option1", "option2"],
      "selectedValue": "most relevant",
      "placeholder": "Select role"
    }
  ],
  "variations": [
    {
      "id": "benefit-first",
      "style": "Benefit-First",
      "text": "Value prop text here",
      "useCase": "Website hero, ad copy",
      "emoji": "🔥",
      "sourceFactIds": ["fact-3", "fact-7"]
    }
  ]
}`;

  const user = `WEBSITE FACTS:
${JSON.stringify(facts, null, 2)}

SELECTED ICP:
${JSON.stringify(icp, null, 2)}

Generate value proposition with evidence tracking. All variations must cite sourceFactIds.`;

  return { system, developer, user };
}

// ============================================================================
// STAGE D: One-Time Email Generation
// ============================================================================

export function buildEmailPrompt(
  facts: FactsJSON,
  icp: ICP,
  valueProp: ValueProp,
  userChoices: EmailUserChoices = {}
): PromptTemplate {
  const system = `You are an expert email marketing strategist for B2B outreach.

OUTPUT FORMAT: Valid JSON only. No commentary.

GUARDRAILS:
- Email must be copy-paste ready
- All claims must be grounded in facts
- Keep body 150-200 words
- One clear CTA
- Cite which facts inform the content`;

  const developer = `TASK: Generate a high-converting one-time email based on facts, ICP, and value proposition.

RULES:
1. Create 3 subject line variations (A, B, C) for testing
   - 30-50 characters each
   - Different approaches: benefit, curiosity, urgency
2. Email body: 150-200 words
   - Personalized hook
   - Address main pain point (from ICP)
   - Present value prop (from variations)
   - Include credibility (from facts.proof)
   - End with strong CTA
3. Tone: ${userChoices.tone || 'professional and conversational'}
4. CTA style: ${userChoices.cta || 'book a call'}
5. Length target: ${userChoices.length || 'medium (150-200 words)'}

EVIDENCE REQUIREMENT:
- Track which facts inform the email via sourceFactIds
- Every specific claim should map to a fact ID
- Example: If mentioning "40% faster", cite the fact ID where this came from

EXAMPLE (Study this structure):
INPUT:
- ICP: "Mid-Market Accounting Firm Owners", persona: "Sarah"
- Pain: "Manual workflows"
- Fact-3: "40% time savings"

OUTPUT EMAIL:
{
  "subjectLines": {
    "A": "Cut your tax prep time by 40% this season",
    "B": "How Martinez & Associates handles 2x more clients",
    "C": "Your team spending 40 hours/week on manual tax work?"
  },
  "emailBody": "Hi Sarah,\\n\\nI noticed Martinez & Associates handles a high volume of corporate tax returns. With tax season approaching, I wanted to share how firms like yours are cutting preparation time by 40%.\\n\\nInstead of spending 40+ hours per week on manual calculations, our AI handles the tedious work while your team focuses on strategy and client relationships.\\n\\n500+ mid-market firms use TaxPro to automate complex tax calculations, eliminate compliance risks, and handle 2x more clients without hiring.\\n\\nWould you be open to a 15-minute demo to see how this could work for your firm?",
  "cta": "Book a 15-minute demo",
  "sourceFactIds": ["fact-3"]
}

Now generate an email following this example structure.

SCHEMA:
{
  "subjectLines": {
    "A": "Subject A",
    "B": "Subject B",
    "C": "Subject C"
  },
  "emailBody": "Full email text",
  "cta": "Call to action",
  "tone": "${userChoices.tone || 'professional'}",
  "benchmarks": {
    "openRate": "25-35%",
    "replyRate": "5-8%",
    "conversionRate": "2-5%"
  },
  "tips": ["tip1", "tip2"],
  "sourceFactIds": ["fact-2", "fact-5"]
}`;

  const user = `WEBSITE FACTS:
${JSON.stringify(facts, null, 2)}

TARGET ICP:
${JSON.stringify(icp, null, 2)}

VALUE PROPOSITION:
${JSON.stringify(valueProp, null, 2)}

Generate one-time email with evidence tracking. Cite sourceFactIds for claims.`;

  return { system, developer, user };
}

// ============================================================================
// STAGE E: Email Sequence Generation
// ============================================================================

export interface EmailSequenceOptions {
  length: 5 | 7 | 10;
  tone?: string;
  goal?: string;
}

export function buildEmailSequencePrompt(
  facts: FactsJSON,
  icp: ICP,
  valueProp: ValueProp,
  options: EmailSequenceOptions
): PromptTemplate {
  const pacing = {
    5: [1, 3, 5, 7, 10],
    7: [1, 3, 5, 7, 10, 14, 21],
    10: [1, 3, 5, 7, 10, 14, 17, 21, 28, 35],
  };

  const days = pacing[options.length];

  const system = `You are an expert email marketing strategist specializing in B2B email sequences.

OUTPUT FORMAT: Valid JSON only. No commentary.

GUARDRAILS:
- All emails must be copy-paste ready
- Each email serves a specific purpose in the sequence
- Ground claims in provided facts
- Maintain consistent tone throughout
- Track evidence via sourceFactIds`;

  const developer = `TASK: Generate a ${options.length}-email sequence based on facts, ICP, and value proposition.

SEQUENCE STRUCTURE:
${options.length === 5 ? `
- Email 1 (Day 1): Introduction + value prop
- Email 2 (Day 3): Address main pain point
- Email 3 (Day 5): Social proof or case study
- Email 4 (Day 7): Overcome objections
- Email 5 (Day 10): Final CTA with urgency
` : options.length === 7 ? `
- Email 1 (Day 1): Introduction + value prop
- Email 2 (Day 3): Address pain point 1
- Email 3 (Day 5): Address pain point 2
- Email 4 (Day 7): Social proof or case study
- Email 5 (Day 10): Value-add content (tip/insight)
- Email 6 (Day 14): Overcome objections
- Email 7 (Day 21): Final CTA with urgency
` : `
- Email 1 (Day 1): Introduction + value prop
- Email 2 (Day 3): Address pain point 1
- Email 3 (Day 5): Address pain point 2
- Email 4 (Day 7): Social proof or case study
- Email 5 (Day 10): Value-add content (tip/insight)
- Email 6 (Day 14): Address pain point 3
- Email 7 (Day 17): Overcome common objection
- Email 8 (Day 21): Alternative approach/angle
- Email 9 (Day 28): Last value touch
- Email 10 (Day 35): Final CTA (breakup email)
`}

RULES:
1. Each email: 100-150 words max
2. Subject lines: 30-50 characters, varied approaches
3. Progressive value delivery (educate → persuade → close)
4. Reference previous emails naturally ("Last week I mentioned...")
5. Tone: ${options.tone || 'professional and conversational'}
6. Goal: ${options.goal || 'book a meeting'}

EVIDENCE REQUIREMENT:
- Track which facts inform each email via sourceFactIds
- Reference specific pain points from ICP
- Use metrics from facts when available

PACING: Days ${days.join(', ')}

SCHEMA:
{
  "sequenceGoal": "What this sequence aims to achieve",
  "sequenceLength": ${options.length},
  "emails": [
    {
      "id": "email-1",
      "dayNumber": ${days[0]},
      "subject": "Subject line here",
      "body": "Email body 100-150 words",
      "cta": "Call to action",
      "purpose": "Why this email exists in the sequence",
      "sourceFactIds": ["fact-2", "fact-5"]
    }
  ],
  "bestPractices": ["tip1", "tip2", "tip3"],
  "expectedOutcome": "What success looks like"
}`;

  const user = `WEBSITE FACTS:
${JSON.stringify(facts, null, 2)}

TARGET ICP:
${JSON.stringify(icp, null, 2)}

VALUE PROPOSITION:
${JSON.stringify(valueProp, null, 2)}

Generate ${options.length}-email sequence with evidence tracking. Days: ${days.join(', ')}`;

  return { system, developer, user };
}

// ============================================================================
// STAGE F: LinkedIn Outreach Generation
// ============================================================================

export interface LinkedInOptions {
  type: 'post' | 'profile_bio' | 'inmail' | 'sequence';
  tone?: string;
}

export function buildLinkedInPrompt(
  facts: FactsJSON,
  icp: ICP,
  valueProp: ValueProp,
  options: LinkedInOptions
): PromptTemplate {
  const system = `You are a LinkedIn content strategist specializing in B2B outreach.

OUTPUT FORMAT: Valid JSON only. No commentary.

GUARDRAILS:
- Content must follow LinkedIn best practices
- Keep within character limits
- Professional yet engaging tone
- Ground claims in facts
- No spammy language`;

  const developer = `TASK: Generate LinkedIn ${options.type} content based on facts, ICP, and value proposition.

TYPE-SPECIFIC RULES:
${options.type === 'post' ? `
- Hook: 1 compelling line
- Body: 3-4 bullet points or short paragraphs
- CTA: Clear next step
- Hashtags: 2-4 relevant tags
- Length: Under 1300 characters (optimal for engagement)
` : options.type === 'profile_bio' ? `
- Opening: 2-3 sentences about expertise
- Value bullets: 3 specific capabilities
- Social proof: Brief mention of results
- CTA: How to connect/work together
- Length: Under 2000 characters
` : options.type === 'inmail' ? `
- Subject: 30 characters max
- Opening: Personalized reference
- Body: 60-120 words (short attention span)
- One ask only
- CTA: Specific next step
` : `
- Message 1: Connection request (300 char limit)
- Message 2: Value-add follow-up (day 3)
- Message 3: Soft pitch (day 7)
- Progressive engagement strategy
`}

TONE: ${options.tone || 'Professional yet conversational'}

EVIDENCE REQUIREMENT:
- Cite sourceFactIds for claims
- Reference specific pain points from ICP
- Use metrics from facts when available

SCHEMA:
${options.type === 'sequence' ? `
{
  "overallStrategy": "Sequence approach and goals",
  "messages": [
    {
      "id": "msg-1",
      "dayNumber": 1,
      "messageType": "connection_request",
      "body": "Message text",
      "characterCount": 250,
      "tips": ["personalization tip"],
      "sourceFactIds": ["fact-2"]
    }
  ],
  "keyTakeaways": ["tip1", "tip2"]
}
` : `
{
  "type": "${options.type}",
  "content": "Main content text",
  "suggestedHashtags": ["#tag1", "#tag2"],
  "callToAction": "CTA text",
  "sourceFactIds": ["fact-2", "fact-5"]
}
`}`;

  const user = `WEBSITE FACTS:
${JSON.stringify(facts, null, 2)}

TARGET ICP:
${JSON.stringify(icp, null, 2)}

VALUE PROPOSITION:
${JSON.stringify(valueProp, null, 2)}

Generate LinkedIn ${options.type} with evidence tracking.`;

  return { system, developer, user };
}

// ============================================================================
// Legacy Constants (keep for backward compatibility)
// ============================================================================

export const EMAIL_STYLES = {
  GREETINGS: {
    name: "Greetings",
    description: "Friendly introduction with value proposition",
    tone: "warm and conversational",
  },
  BOOK_A_CALL: {
    name: "Book a Call",
    description: "Direct call-to-action to schedule a meeting",
    tone: "professional and concise",
  },
} as const;

export const LINKEDIN_TONES = {
  PRACTICAL: {
    name: "Practical",
    description: "Actionable insights and real-world application",
    style: "1 hook line, 3 bullets, 1 CTA",
  },
  THOUGHT_LEADERSHIP: {
    name: "Thought Leadership",
    description: "Industry perspective and strategic thinking",
    style: "Story-driven with key takeaways",
  },
} as const;

export const SEQUENCE_PACING = {
  5: [1, 3, 5, 7, 10],
  7: [1, 3, 5, 7, 10, 14, 21],
  10: [1, 3, 5, 7, 10, 14, 17, 21, 28, 35],
} as const;

export const EMAIL_BEST_PRACTICES = [
  "Keep subject lines under 50 characters",
  "Body text should be 150-200 words",
  "Include one clear CTA per email",
  "Address pain points early",
  "Use short paragraphs (2-3 lines max)",
  "Personalize beyond just {{firstName}}",
] as const;

export const LINKEDIN_LIMITS = {
  POST_MAX: 3000,
  POST_OPTIMAL: 1300,
  CONNECTION_REQUEST_MAX: 300,
  INMAIL_MAX: 2000,
  INMAIL_OPTIMAL: 120,
} as const;

export const EMAIL_BENCHMARKS = {
  ONE_TIME: {
    openRate: "25-35%",
    replyRate: "5-8%",
    conversionRate: "2-5%",
  },
  SEQUENCE: {
    openRate: "30-40%",
    replyRate: "8-12%",
    conversionRate: "5-10%",
  },
} as const;

export const LINKEDIN_BENCHMARKS = {
  CONNECTION_ACCEPTANCE: "30-40%",
  MESSAGE_RESPONSE: "10-15%",
  POST_ENGAGEMENT: "2-5%",
} as const;

export default {
  buildAnalyzePrompt,
  buildICPPrompt,
  buildValuePropPrompt,
  buildEmailPrompt,
  EMAIL_STYLES,
  LINKEDIN_TONES,
  SEQUENCE_PACING,
  EMAIL_BEST_PRACTICES,
  LINKEDIN_LIMITS,
  EMAIL_BENCHMARKS,
  LINKEDIN_BENCHMARKS,
};
